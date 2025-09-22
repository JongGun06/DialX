// app/(main)/characters/create.tsx
import React from 'react';
import { View, StyleSheet, Alert, Text, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Colors } from '@/constants/Colors';
import StyledInput from '@/components/auth/StyledInput';
import PrimaryButton from '@/components/auth/PrimaryButton';
import { useCreateAiCharacterMutation } from '@/store/services/aiCharactersApi';

type FormData = {
  name: string;
  persona: string;
};

const characterSchema = z.object({
  name: z.string().min(3, 'Имя должно быть не менее 3 символов'),
  persona: z.string().min(10, 'Описание должно быть не менее 10 символов'),
});

export default function CreateCharacterScreen() {
  const router = useRouter();
  const [createAiCharacter, { isLoading }] = useCreateAiCharacterMutation();

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: { name: '', persona: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createAiCharacter(data).unwrap();
      Alert.alert(
        'Успех!', 
        'Новый персонаж успешно создан.',
        [{ text: 'OK', onPress: () => {
          reset();
          router.back();
        }}]
      );
    } catch (error: any) {
      console.error('Failed to create AI character:', error);
      const errorMessage = error.data?.message || 'Не удалось создать персонажа.';
      Alert.alert('Ошибка', errorMessage);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: '   Новый персонаж' }} />
      
      <Text style={styles.label}>Имя Персонажа</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <StyledInput
            label="Например, Шерлок Холмс"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.name?.message}
          />
        )}
      />

      <Text style={styles.label}>Персона (Описание характера)</Text>
      <Controller
        control={control}
        name="persona"
        render={({ field: { onChange, onBlur, value } }) => (
          <StyledInput
            label="Опишите его личность, знания, стиль речи..."
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.persona?.message}
            multiline
            style={styles.textArea}
            containerStyle={{ height: 150, marginBottom: 40 }}
          />
        )}
      />

      <PrimaryButton
        title={isLoading ? 'Создание...' : 'Создать Персонажа'}
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 24,
  },
});