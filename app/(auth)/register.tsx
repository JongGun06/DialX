// app/(auth)/register.tsx
import React from 'react';
import { View, StyleSheet, Alert, Text, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';

import AuthLayout from '@/components/auth/AuthLayout';
import StyledInput from '@/components/auth/StyledInput';
import PrimaryButton from '@/components/auth/PrimaryButton';
import { useRegisterMutation } from '@/store/services/authApi';
import { RegisterData } from '@/types/auth';
import { Colors } from '@/constants/Colors';

const registerSchema = z.object({
  username: z.string().min(3, 'Имя пользователя минимум 3 символа'),
  email: z.string().email('Неверный формат email'),
  password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
});

export default function RegisterScreen() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterData) => {
    try {
      const response = await register(data).unwrap();
      Alert.alert(
        'Регистрация успешна',
        response.message,
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err: any) {
      const errorMessage = err.data?.message || 'Произошла ошибка';
      Alert.alert('Ошибка регистрации', errorMessage);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.header}>
        <Text style={styles.title}>Создать аккаунт</Text>
      </View>

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <StyledInput
            label="Имя пользователя"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.username?.message}
            autoCapitalize="none"
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <StyledInput
            label="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <StyledInput
            label="Пароль"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.password?.message}
            secureTextEntry
          />
        )}
      />

      <PrimaryButton
        title="Зарегистрироваться"
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
      />

      <Pressable onPress={() => router.push('/(auth)/login')} style={styles.footerButton}>
        <Text style={styles.footerText}>Уже есть аккаунт? Войти</Text>
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  footerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.primary,
    fontSize: 16,
  },
});