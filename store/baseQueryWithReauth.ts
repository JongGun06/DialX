// store/baseQueryWithReauth.ts

import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import * as SecureStore from 'expo-secure-store';

import { setCredentials, logout } from './slices/authSlice';
import { RootState } from './index';
import { API_BASE_URL } from '@/constants/api';
import { AuthResponse } from '@/types/auth';

// Создаем мьютекс, чтобы избежать гонки запросов на обновление токена
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Ждем, пока мьютекс освободится, прежде чем продолжить
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Если получили 401, пытаемся обновить токен
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = (api.getState() as RootState).auth.refreshToken;
        if (refreshToken) {
          // Отправляем запрос на обновление токена
          const refreshResult = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          const newTokens: AuthResponse = await refreshResult.json();

          if (newTokens.accessToken) {
            // Если получили новые токены, обновляем их в Redux и SecureStore
            api.dispatch(setCredentials(newTokens));
            await SecureStore.setItemAsync('accessToken', newTokens.accessToken);
            await SecureStore.setItemAsync('refreshToken', newTokens.refreshToken);

            // Повторяем оригинальный запрос с новым токеном
            result = await baseQuery(args, api, extraOptions);
          } else {
            // Если обновление не удалось, разлогиниваем пользователя
            api.dispatch(logout());
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
          }
        } else {
          // Если нет refresh токена, просто разлогиниваем
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      // Если мьютекс уже был заблокирован, значит, обновление токена уже в процессе.
      // Просто ждем его завершения и повторяем запрос.
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};