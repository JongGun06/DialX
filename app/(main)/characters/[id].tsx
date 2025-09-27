import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Text, ActivityIndicator, ImageBackground } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { useGetAiMessagesQuery } from '@/store/services/aiCharactersApi';
import { API_BASE_URL } from '@/constants/api';
import { Message, Profile } from '@/types/chat';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';
import { useTheme } from '@/hooks/useTheme';
  import { SafeAreaView } from 'react-native-safe-area-context';


export default function AiChatScreen() {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);

  const { id: characterId, name, avatarUrl } = useLocalSearchParams<{ id: string; name: string; avatarUrl: string }>();
  const currentUser = useAppSelector(selectCurrentUser);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const flatListRef = useRef<FlatList<Message>>(null);
  
  const { data: history, isLoading, isError } = useGetAiMessagesQuery(characterId!);

  const socketRef = useRef<Socket | null>(null);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(API_BASE_URL, {
      auth: { token: accessToken },
    });
    socketRef.current = socket;

    socket.on('connect', () => console.log('Socket connected for AI chat'));
    
    socket.on('aiMessage', (newMessage: any) => {
      const authorProfile: Profile = {
        id: newMessage.characterId,
        username: newMessage.characterName,
        avatarUrl: avatarUrl || '',
        userId: 'ai_user_placeholder'
      };
      const formattedMessage: Message = { ...newMessage, author: authorProfile };
      setLiveMessages((prevMessages) => [...prevMessages, formattedMessage]);
      setIsSending(false);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setIsSending(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, characterId, avatarUrl]);

  const handleSend = (content: string) => {
    if (socketRef.current && currentUser && content.trim()) {
      setIsSending(true);
      const userMessage: Message = {
        id: new Date().toISOString(),
        content,
        createdAt: new Date().toISOString(),
        author: currentUser,
      };
      setLiveMessages((prevMessages) => [...prevMessages, userMessage]);

      socketRef.current.emit('sendMessageToAi', {
        characterId,
        content,
      });
    }
  };
  
  const sortedMessages = useMemo(() => 
    [...(history || []), ...liveMessages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  , [history, liveMessages]);

  useEffect(() => {
    if (sortedMessages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [sortedMessages.length]);

  if (isLoading || !currentUser) return <ActivityIndicator size="large" color={Colors.primary} style={styles.centered} />;
  if (isError) return <View style={styles.centered}><Text style={{color: Colors.error}}>Ошибка загрузки истории</Text></View>;


return (
  <ImageBackground
    source={theme.wallpaperUrl ? { uri: theme.wallpaperUrl } : undefined}
    style={styles.backgroundImage}
    imageStyle={{ opacity: 0.1 }}
    resizeMode="cover"
  >
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Stack.Screen
          options={{
            title: name,
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.text,
            headerTransparent: true,
          }}
        />
        <View style={styles.listContainer}>
          <FlatList
            ref={flatListRef}
            data={sortedMessages}
            renderItem={({ item }) => (
              <MessageBubble
                content={item.content}
                createdAt={item.createdAt}
                isOwn={item.author.id === currentUser.id}
                fileUrl={item.fileUrl}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        </View>
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: Colors.surface }}>
          <MessageInput
          onSend={handleSend}
          isSending={isSending}
          onAttach={() => {}}
        />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </ImageBackground>
);

}

const createStyles = (Colors: any) => StyleSheet.create({
    backgroundImage: { 
      flex: 1, 
      backgroundColor: Colors.background 
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    centered: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
        paddingTop: 100, // Отступ для заголовка
    },
    listContent: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
});