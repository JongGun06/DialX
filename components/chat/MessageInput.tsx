// components/chat/MessageInput.tsx
import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

type Props = {
  onSend: (message: string) => void;
  onAttach: () => void;
  isSending: boolean;
};

export default function MessageInput({ onSend, onAttach, isSending }: Props) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim().length > 0) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onAttach} style={styles.attachButton} disabled={isSending}>
        <Ionicons name="attach" size={24} color={Colors.textSecondary} />
      </Pressable>
      <TextInput
        value={text}
        onChangeText={setText}
        style={styles.input}
        placeholder="Сообщение"
        placeholderTextColor={Colors.textSecondary}
        multiline
      />
      <Pressable 
        onPress={handleSend} 
        disabled={isSending || text.trim().length === 0}
        style={({ pressed }) => [
          styles.sendButton,
          { opacity: (isSending || text.trim().length === 0) ? 0.5 : (pressed ? 0.8 : 1) }
        ]}
      >
        <Ionicons name="send" size={22} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 25,
    backgroundColor: Colors.surface,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    color: Colors.text,
    fontSize: 16,
    marginHorizontal: 8,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});