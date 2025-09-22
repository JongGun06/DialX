// components/chat/MessageBubble.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import dayjs from 'dayjs';
import { Colors } from '@/constants/Colors';

type Props = {
  content?: string;
  fileUrl?: string;
  createdAt: string;
  isOwn: boolean;
};

export default function MessageBubble({ content, fileUrl, createdAt, isOwn }: Props) {
  const isImage = fileUrl; // Упрощенная проверка

  return (
    <View style={[
      styles.container,
      isOwn ? styles.ownContainer : styles.otherContainer
    ]}>
      <View style={[
        styles.bubble,
        isOwn ? styles.ownBubble : styles.otherBubble
      ]}>
        {isImage && (
          <Image source={{ uri: fileUrl }} style={styles.image} />
        )}
        {content && (
          <Text style={styles.content}>{content}</Text>
        )}
        <Text style={[styles.time, { color: isOwn ? 'rgba(255, 255, 255, 0.7)' : Colors.textSecondary }]}>
          {dayjs(createdAt).format('HH:mm')}
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 4, // Уменьшаем общий padding, т.к. контент может быть разным
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  content: {
    color: Colors.text,
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  time: {
    fontSize: 12,
    alignSelf: 'flex-end',
    paddingRight: 8,
    paddingBottom: 4,
  },
});