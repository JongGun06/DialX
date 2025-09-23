import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Chat } from '@/types/chat';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { useTheme } from '@/hooks/useTheme';
import { selectOnlineUserIds } from '@/store/slices/presenceSlice'; // <-- ДОБАВЛЕНО


dayjs.extend(relativeTime);

type Props = {
  chat: Chat;
};

export default function ChatListItem({ chat }: Props) {
    const onlineUserIds = useAppSelector(selectOnlineUserIds); // <-- Получаем статусы
    
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);

  const router = useRouter();
  const currentUser = useAppSelector(selectCurrentUser);

  const getDisplayData = () => {
    if (chat.isGroup) {
      const name = chat.name || 'Новая группа';
      const avatar = chat.avatarUrl || `https://i.pinimg.com/736x/ca/8c/7d/ca8c7de3ae607348b5d3f124eba8a3ee.jpg`;
      return { name, avatar };
    } else {
      const otherParticipant = chat.participants?.find(p => p.id !== currentUser?.id);
      if (otherParticipant) {
        const name = otherParticipant.username;
        const avatar = otherParticipant.avatarUrl || `https://i.pinimg.com/736x/ca/8c/7d/ca8c7de3ae607348b5d3f124eba8a3ee.jpg`;
                const isOnline = onlineUserIds[otherParticipant.id]; // <-- Проверяем статус
        return { name, avatar,isOnline };
      }
      return { name: 'Личный чат', avatar: `https://i.pinimg.com/736x/ca/8c/7d/ca8c7de3ae607348b5d3f124eba8a3ee.jpg` };
    }
  };

  const { name, avatar,isOnline } = getDisplayData();
  const lastMessage = chat.lastMessage;

  const handlePress = () => {
    router.push({
      pathname: '/(main)/chat/[id]',
      params: { 
        id: chat.id,
        name, 
        isGroup: (chat.isGroup ?? false).toString() 
      },
    });
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name}>{name}</Text>
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

const createStyles = (Colors: any) => StyleSheet.create({
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
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: Colors.background,
  },
});