// app/_layout.tsx

import 'react-native-gesture-handler'; // <-- ДОБАВИТЬ ЭТУ СТРОКУ!
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Provider } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { selectIsLoggedIn, setCredentials, setCurrentUser } from '@/store/slices/authSlice';
import { useGetMeQuery } from '@/store/services/profileApi';
import { ThemeProvider } from '@/context/ThemeContext'; // <-- ДОБАВЛЕНО


function AuthHandler() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  
  // Запускаем запрос на получение профиля, если пользователь залогинен,
  // но данных о нем еще нет
  const { data: user, error, isLoading } = useGetMeQuery(undefined, {
    skip: !isLoggedIn,
  });

  useEffect(() => {
    // Когда данные о пользователе успешно загружены, сохраняем их в store
    if (user) {
      dispatch(setCurrentUser(user));
    }
  }, [user, dispatch]);

  return null; // Этот компонент не рендерит UI
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (accessToken && refreshToken) {
          dispatch(setCredentials({ accessToken, refreshToken }));
        }
      } finally {
        setIsAuthReady(true);
      }
    };
    checkAuth();
  }, [dispatch]);
  
  useEffect(() => {
    if (!isAuthReady) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (isLoggedIn && inAuthGroup) {
      router.replace('/(main)/chats');
    } else if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [isLoggedIn, isAuthReady, segments, router]);

  if (!isAuthReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthHandler />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}