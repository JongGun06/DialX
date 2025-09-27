import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  onSend: (message: string) => void;
  onAttach: () => void;
  isSending: boolean;
};

export default function MessageInput({ onSend, onAttach, isSending }: Props) {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);

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
        style={({ pressed }) => [styles.sendButton, { opacity: (isSending || text.trim().length === 0) ? 0.5 : (pressed ? 0.8 : 1) }]}
      >
        <Ionicons name="send" size={22} color="white" />
      </Pressable>
    </View>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', // Выравниваем по низу для multiline
    paddingHorizontal: 8, 
    paddingVertical: 8, 
    backgroundColor: Colors.surface,
  },
  attachButton: { 
    padding: 8,
    marginBottom: 5, // Небольшой отступ для выравнивания
  },
  input: {
  flex: 1,
  backgroundColor: Colors.background,
  borderRadius: 20,
  paddingHorizontal: 14,
  paddingVertical: 8,
  fontSize: 16,
  color: Colors.text,
  maxHeight: 120,
},
  sendButton: { 
    backgroundColor: Colors.primary, 
    width: 44, // Немного увеличим для удобства
    height: 44,
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 1,
  },
});