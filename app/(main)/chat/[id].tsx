import React, { useRef, useEffect, useMemo } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, Pressable, ImageBackground } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useGetMessagesQuery, useSendMessageMutation, useGetChatDetailsQuery } from '@/store/services/chatsApi';
import { useUploadFileMutation } from '@/store/services/filesApi';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { selectOnlineUserIds } from '@/store/slices/presenceSlice';
import { chatsApi } from '@/store/services/chatsApi';
import { socket } from '@/store/socket';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';
import { Message } from '@/types/chat';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);
  const router = useRouter();
  const { id: chatId, name, isGroup: isGroupStr } = useLocalSearchParams<{ id: string; name: string; isGroup: string }>();
  const isGroup = isGroupStr === 'true';
  const currentUser = useAppSelector(selectCurrentUser);
  const onlineUserIds = useAppSelector(selectOnlineUserIds);
  const dispatch = useAppDispatch();
  const flatListRef = useRef<FlatList<Message>>(null);
  
  const { data: chatDetails } = useGetChatDetailsQuery(chatId!, { skip: isGroup });
  const { data: messages, isLoading, isError } = useGetMessagesQuery(chatId!);
  const [sendMessage, { isLoading: isSendingText }] = useSendMessageMutation();
  const [uploadFile, { isLoading: isUploadingFile }] = useUploadFileMutation();

  const otherParticipant = useMemo(() => {
    if (isGroup || !chatDetails) return null;
    return chatDetails.participants.find(p => p.id !== currentUser?.id) || null;
  }, [chatDetails, currentUser, isGroup]);
  
  const isOtherUserOnline = useMemo(() => {
    if (!otherParticipant) return false;
    return onlineUserIds.includes(otherParticipant.userId);
  }, [otherParticipant, onlineUserIds]);

  useEffect(() => {
    if (!socket || !chatId || !currentUser) return;
    socket.emit('joinRoom', { chatId });
    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.author.id === currentUser.id) return;
      dispatch(
        chatsApi.util.updateQueryData('getMessages', chatId, (draft) => {
          if (!draft.find((msg) => msg.id === newMessage.id)) {
            draft.push(newMessage);
          }
        })
      );
    };
    socket.on('newMessage', handleNewMessage);
    return () => {
      if (socket) {
        socket.emit('leaveRoom', { chatId });
        socket.off('newMessage', handleNewMessage);
      }
    };
  }, [chatId, currentUser, dispatch]);

  const handleSendText = async (content: string) => {
    if (!content.trim()) return;
    try { await sendMessage({ chatId: chatId!, content }).unwrap(); }
    catch (error) { Alert.alert('Ошибка', 'Не удалось отправить сообщение'); }
  };

  const handleAttach = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Требуется разрешение', 'Пожалуйста, предоставьте доступ к вашей галерее.');
      
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const file = result.assets[0];
      const formData = new FormData();
      const fileName = (file.fileName || `photo_${Date.now()}`).split('.')[0] + '.jpg';
      formData.append('file', { uri: file.uri, name: fileName, type: 'image/jpeg' } as any);

      const uploadResult = await uploadFile(formData).unwrap();
      await sendMessage({ chatId: chatId!, fileUrl: uploadResult.url }).unwrap();
    } catch (error) { Alert.alert('Ошибка', 'Не удалось загрузить и отправить файл.'); }
  };
  
  const sortedMessages = useMemo(() => 
    messages ? [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : []
  , [messages]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  if (isLoading || !currentUser) return <ActivityIndicator size="large" color={Colors.primary} style={styles.centered} />;
  if (isError) return <View style={styles.centered}><Text style={styles.errorText}>Не удалось загрузить сообщения.</Text></View>;

return (
  <ImageBackground
    source={theme.wallpaperUrl ? { uri: theme.wallpaperUrl } : undefined}
    style={styles.backgroundImage}
    imageStyle={{ opacity: 0.15 }}
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
            headerTitle: () => (
              <Pressable
                disabled={!isGroup}
                onPress={() => router.push(`/(main)/chats/info/${chatId}` as any)}
              >
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerTitle}>{name}</Text>
                </View>
              </Pressable>
            ),
          }}
        />
        <View style={styles.listContainer}>
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
        </View>
          <View style={styles.inputWrapper}>
           <MessageInput
          onSend={handleSendText}
          onAttach={handleAttach}
          isSending={isSendingText || isUploadingFile}
        />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </ImageBackground>
);

}

const createStyles = (Colors: any) => StyleSheet.create({
  backgroundImage: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  listContainer: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  errorText: { color: Colors.error },
  listContent: { paddingVertical: 8, paddingHorizontal: 10 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  statusText: { fontSize: 13, marginTop: 1 },
  inputWrapper: {
  borderTopWidth: StyleSheet.hairlineWidth,
  borderTopColor: Colors.border,
  backgroundColor: Colors.surface,
  paddingVertical: 6,
  paddingHorizontal: 8,
},
});