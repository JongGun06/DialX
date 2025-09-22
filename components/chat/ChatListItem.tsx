// components/chat/ChatListItem.tsx

import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Chat } from '@/types/chat';
import { Colors } from '@/constants/Colors';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';

dayjs.extend(relativeTime);

type Props = {
  chat: Chat;
};

export default function ChatListItem({ chat }: Props) {
  const router = useRouter();
  const currentUser = useAppSelector(selectCurrentUser);

  // v-- ЗДЕСЬ ВСЯ НОВАЯ ЛОГИКА --v
  const getDisplayData = () => {
    if (chat.isGroup) {
      // Для групп оставляем старую логику
      const name = chat.name || 'Новая группа';
      const avatar = chat.avatarUrl || `https://i.pravatar.cc/150?u=${chat.id}`;
      return { name, avatar };
    } else {
      // Для личных чатов ищем другого участника
      const otherParticipant = chat.participants?.find(p => p.id !== currentUser?.id);
      
      if (otherParticipant) {
        // И используем его данные
        const name = otherParticipant.username;
        const avatar = otherParticipant.avatarUrl || `https://i.pravatar.cc/150?u=${otherParticipant.id}`;
        return { name, avatar };
      }

      // Запасной вариант, если что-то пошло не так
      return { name: 'Личный чат', avatar: `https://i.pravatar.cc/150?u=${chat.id}` };
    }
  };
  // ^-- КОНЕЦ НОВОЙ ЛОГИКИ --^

  const { name, avatar } = getDisplayData();
  const lastMessage = chat.lastMessage;

  const handlePress = () => {
    router.push({
      pathname: '/(main)/chat/[id]',
      params: { 
        id: chat.id,
        name, 
        isGroup: chat.isGroup.toString() 
      },
    });
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {lastMessage && (
            <Text style={styles.time}>{dayjs(lastMessage.createdAt).fromNow(true)}</Text>
          )}
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {lastMessage?.content || 'Нет сообщений'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surface,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});