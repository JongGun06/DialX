// app/(main)/chats/finalize.tsx

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme'; // <-- ШАГ 1
import PrimaryButton from '@/components/auth/PrimaryButton';
import StyledInput from '@/components/auth/StyledInput';
import { useCreateGroupChatMutation } from '@/store/services/chatsApi';

export default function FinalizeGroupScreen() {
  const { theme } = useTheme(); // <-- ШАГ 2
  const Colors = theme;
  const styles = createStyles(Colors); 
  const router = useRouter();
  const params = useLocalSearchParams<{ userIds: string }>();
  const userIds = params.userIds?.split(',') || [];
  
  const [groupName, setGroupName] = useState('');
  const [createGroupChat, { isLoading }] = useCreateGroupChatMutation();

  const handleFinalize = async () => {
    if (groupName.trim().length < 3) {
      Alert.alert('Ошибка', 'Название группы должно быть не менее 3 символов.');
      return;
    }

    try {
      const newChat = await createGroupChat({
        name: groupName.trim(),
        profileIds: userIds,
      }).unwrap();

      // Заменяем текущий стек навигации, чтобы нельзя было вернуться назад
      // и переходим в созданный чат
      router.replace(`/(main)/chat/${newChat.id}`);

    } catch (error) {
      console.error('Failed to create group:', error);
      Alert.alert('Ошибка', 'Не удалось создать группу.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Название группы' }} />

      <StyledInput
        label="Введите название группы"
        value={groupName}
        onChangeText={setGroupName}
        containerStyle={{ marginTop: 20 }}
      />

      <View style={styles.footer}>
        <PrimaryButton
          title="Создать чат"
          onPress={handleFinalize}
          isLoading={isLoading}
        />
      </View>
    </View>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({ // <-- ШАГ 3 (часть 1)
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  footer: {
    marginTop: 'auto', // Прижимаем кнопку к низу
    paddingBottom: 20,
  },
});