// store/services/authApi.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthCredentials, AuthResponse, RegisterData } from '@/types/auth';
import { API_BASE_URL } from '@/constants/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  endpoints: (builder) => ({
    register: builder.mutation<{ message: string }, RegisterData>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<AuthResponse, AuthCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    // v-- НОВЫЙ ЭНДПОИНТ --v
    refresh: builder.mutation<AuthResponse, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),
    // ^-- НОВЫЙ ЭНДПОИНТ --^
  }),
});

export const { useRegisterMutation, useLoginMutation, useRefreshMutation } = authApi;