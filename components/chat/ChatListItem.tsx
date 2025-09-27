import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import { Chat } from '@/types/chat';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  chat: Chat;
};

export default function ChatListItem({ chat }: Props) {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);
  const currentUser = useAppSelector(selectCurrentUser);

  // --- "ПУЛЕНЕПРОБИВАЕМЫЕ" ПРОВЕРКИ ---

  // 1. Проверяем все необходимые данные. Если чего-то нет, компонент не рендерится.
  if (!currentUser || !chat || !Array.isArray(chat.participants)) {
    console.warn('ChatListItem пропущен из-за неполных данных:', { chat });
    return null;
  }

  const isGroup = chat.isGroup;
  
  // 2. Ищем собеседника, но теперь с дополнительной проверкой на `p`.
  const otherParticipant = !isGroup 
    ? chat.participants.find(p => p && p.id !== currentUser.id) // Проверяем, что `p` существует!
    : null;

  // Если это личный чат, но собеседника найти не удалось (например, чат с самим собой или "битый" чат)
  if (!isGroup && !otherParticipant) {
    console.warn('Не удалось найти собеседника в личном чате:', { chat });
    return null; // Не рендерим этот чат
  }

  const name = isGroup ? chat.name : otherParticipant?.username || 'Чат';
  const avatarUrl = isGroup ? chat.avatarUrl : otherParticipant?.avatarUrl;
  const defaultAvatar = 'https://i.pinimg.com/736x/ca/8c/7d/ca8c7de3ae607348b5d3f124eba8a3ee.jpg';

  const lastMessage = chat.messages?.[0]?.content || 'Нет сообщений';

  return (
    <Link href={{ pathname: `/(main)/chat/${chat.id}`, params: { name, isGroup: String(isGroup) } }} asChild>
      <Pressable style={styles.container}>
        <Image
          source={{ uri: avatarUrl || defaultAvatar }}
          style={{ width: 50, height: 50, borderRadius: 25 }}
        />
        <View style={styles.content}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8 },
  content: { flex: 1, marginLeft: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.surface, paddingBottom: 12 },
  name: { fontWeight: 'bold', fontSize: 16, color: Colors.text },
  lastMessage: { color: Colors.textSecondary, marginTop: 2 },
});