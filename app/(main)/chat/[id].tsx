import React, { useRef, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useGetMessagesQuery, useSendMessageMutation } from '@/store/services/chatsApi';
import { useUploadFileMutation } from '@/store/services/filesApi';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';
import { Message } from '@/types/chat';
import { useTheme } from '@/hooks/useTheme';

export default function ChatScreen() {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);

  const router = useRouter();
  const { id: chatId, name, isGroup } = useLocalSearchParams<{ id: string; name: string; isGroup: string }>();
  const currentUser = useAppSelector(selectCurrentUser);
  const flatListRef = useRef<FlatList<Message>>(null);

  const { data: messages, isLoading, isError } = useGetMessagesQuery(chatId!);
  const [sendMessage, { isLoading: isSendingText }] = useSendMessageMutation();
  const [uploadFile, { isLoading: isUploadingFile }] = useUploadFileMutation();


  const handleSendText = async (content: string) => {
    try {
      await sendMessage({ chatId: chatId!, content }).unwrap();
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
    }
  };

  const handleAttach = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Необходимо разрешение на доступ к галерее.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    const file = result.assets[0];
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.fileName || 'photo.jpg',
      type: file.mimeType || 'image/jpeg',
    } as any);

    try {
      const uploadResult = await uploadFile(formData).unwrap();
      await sendMessage({ chatId: chatId!, fileUrl: uploadResult.url }).unwrap();
    } catch (error) {
      console.error('Failed to upload file or send message:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить файл.');
    }
  };
  
  const sortedMessages = messages ? [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [];

  useEffect(() => {
    if (sortedMessages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [sortedMessages.length]);

  if (isLoading || !currentUser) {
    return <ActivityIndicator size="large" color={Colors.primary} style={styles.centered} />;
  }

  if (isError || !messages) {
    return <View style={styles.centered}><Text style={styles.errorText}>Не удалось загрузить сообщения.</Text></View>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
    >
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Pressable 
              disabled={isGroup !== 'true'}
              onPress={() => router.push(`/(main)/chats/info/${chatId}` as any)}
            >
              <Text style={styles.headerTitle}>{name}</Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        ref={flatListRef}
        data={sortedMessages}
        renderItem={({ item }) => (
          <MessageBubble
            content={item.content}
            fileUrl={item.fileUrl}
            createdAt={item.createdAt}
            isOwn={item.author.id === currentUser.id}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
      <MessageInput 
        onSend={handleSendText} 
        onAttach={handleAttach} 
        isSending={isSendingText || isUploadingFile} 
      />
    </KeyboardAvoidingView>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  errorText: { color: Colors.error },
  listContent: { paddingVertical: 8 },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold' },
});