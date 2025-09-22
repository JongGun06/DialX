// app/(auth)/login.tsx
import React from 'react';
import { View, StyleSheet, Alert, Text, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '@/constants/Colors'; // <-- Вот этот импорт
import AuthLayout from '@/components/auth/AuthLayout';
import StyledInput from '@/components/auth/StyledInput';
import PrimaryButton from '@/components/auth/PrimaryButton';
import { useLoginMutation } from '@/store/services/authApi';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/store/slices/authSlice';
import { AuthCredentials } from '@/types/auth';

const loginSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(1, 'Пароль не может быть пустым'),
});

export default function LoginScreen() {
  // ... остальная логика компонента не меняется
  // ... скопируй этот файл целиком, чтобы быть уверенным
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: AuthCredentials) => {
    try {
      const tokens = await login(data).unwrap();
      await SecureStore.setItemAsync('accessToken', tokens.accessToken);
      await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
      console.log("LOGIN TOKENS", tokens);
      dispatch(setCredentials(tokens));
      router.replace('/(main)/chats');
    } catch (err: any) {
      const errorMessage = err.data?.message || 'Произошла ошибка';
      Alert.alert('Ошибка входа', errorMessage);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.header}>
        <Text style={styles.title}>Вход</Text>
        <Text style={styles.subtitle}>Добро пожаловать в DialX</Text>
      </View>
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
        title="Войти"
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
      />
      <Pressable onPress={() => router.push('/register')} style={styles.footerButton}>
        <Text style={styles.footerText}>Нет аккаунта? Зарегистрироваться</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
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