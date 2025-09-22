// components/ai/AiCharacterListItem.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AiCharacter } from '@/types/ai';
import { Colors } from '@/constants/Colors';

type Props = {
  character: AiCharacter;
};

export default function AiCharacterListItem({ character }: Props) {
  const router = useRouter();
  const avatar = character.avatarUrl || `https://i.pravatar.cc/150?u=${character.id}`;

  const handlePress = () => {
    // ИСПРАВЛЕНИЕ ЗДЕСЬ:
    // Мы передаем шаблон пути в `pathname`
    // и все параметры, включая `id`, в объекте `params`
    router.push({
      pathname: '/(main)/characters/[id]',
      params: { id: character.id, name: character.name, avatarUrl: avatar }
    });
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{character.name}</Text>
        <Text style={styles.persona} numberOfLines={2}>{character.persona}</Text>
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
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  persona: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});