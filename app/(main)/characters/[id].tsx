import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { useGetAiMessagesQuery } from '@/store/services/aiCharactersApi';
import { API_BASE_URL } from '@/constants/api';
import { Message } from '@/types/chat';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';
import { useTheme } from '@/hooks/useTheme';

export default function AiChatScreen() {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);

  const { id: characterId, name } = useLocalSearchParams<{ id: string; name: string; avatarUrl: string }>();
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
      extraHeaders: { Authorization: `Bearer ${accessToken}` },
    });
    socketRef.current = socket;

    socket.on('connect', () => console.log('Socket connected for AI chat'));
    
    socket.on('aiMessage', (newMessage: any) => {
      const formattedMessage: Message = { ...newMessage, author: { id: newMessage.characterId, username: newMessage.characterName }};
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
  }, [accessToken, characterId]);

  const handleSend = (content: string) => {
    if (socketRef.current && currentUser) {
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
  
  const combinedMessages = [...(history || []), ...liveMessages];
  const sortedMessages = combinedMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  useEffect(() => {
    if (sortedMessages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [sortedMessages.length]);

  if (isLoading || !currentUser) {
    return <ActivityIndicator size="large" color={Colors.primary} style={styles.container} />;
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={{color: 'white'}}>Ошибка загрузки истории</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
    >
      <Stack.Screen options={{ title: name }} />
      <FlatList
        ref={flatListRef}
        data={sortedMessages}
        renderItem={({ item }) => (
          <MessageBubble
            content={item.content}
            createdAt={item.createdAt}
            isOwn={item.author.id === currentUser.id}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
      <MessageInput onSend={handleSend} isSending={isSending} onAttach={() => {}} />
    </KeyboardAvoidingView>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center'
    },
    listContent: {
        paddingVertical: 8,
    },
});