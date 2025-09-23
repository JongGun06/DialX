// store/services/profileApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { io, Socket } from 'socket.io-client';
import { Profile, Message } from '@/types/chat';
import { baseQueryWithReauth } from '../baseQueryWithReauth';
import { API_BASE_URL } from '@/constants/api';
import { RootState } from '..';
import { setInitialOnlineUsers, userCameOnline, userWentOffline } from '../slices/presenceSlice';
import { chatsApi } from './chatsApi';

type UpdateProfileDto = {
    username?: string;
    settings?: {
        theme: { [key: string]: string }; // Тема теперь - это объект с цветами
    };
}
export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getMe: builder.query<Profile, void>({
      query: () => '/profile/me',
      providesTags: [{ type: 'Profile', id: 'ME' }],
      async onCacheEntryAdded(
        arg,
        { getState, dispatch, cacheEntryRemoved, cacheDataLoaded }
      ) {
        await cacheDataLoaded;
        const token = (getState() as RootState).auth.accessToken;
        if (!token) return;

        console.log(`[Socket] Попытка подключения к: ${API_BASE_URL}`);
        const socket: Socket = io(API_BASE_URL, {
          auth: { token: token },
          transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => console.log(`[Socket] Успешно подключено! ID сокета: ${socket.id}`));
        socket.on('disconnect', (reason) => console.log(`[Socket] Отключено по причине: ${reason}`));
        socket.on('connect_error', (err) => console.error(`[Socket] ОШИБКА ПОДКЛЮЧЕНИЯ: ${err.message}`));

        socket.on('onlineUsersList', (userIds: string[]) => {
          console.log('[Socket] Получен список онлайн-пользователей:', userIds);
          dispatch(setInitialOnlineUsers(userIds));
        });

        socket.on('presenceUpdate', (data) => {
          console.log('[Socket] Получено обновление статуса:', data);
          const { userId, status } = data;
          if (status === 'online') dispatch(userCameOnline(userId));
          else dispatch(userWentOffline(userId));
        });

        // САМЫЙ ВАЖНЫЙ СЛУШАТЕЛЬ
        socket.on('newMessage', (message: Message) => {
          console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
          console.log('[Socket] ПОЛУЧЕНО НОВОЕ СООБЩЕНИЕ:', JSON.stringify(message, null, 2));
          console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
          
          const currentUser = (getState() as RootState).auth.currentUser;
          if (message.author.id === currentUser?.id) return;
          
          dispatch(chatsApi.util.updateQueryData('getMessages', message.chatId!, (draft) => {
            if (!draft.find((msg) => msg.id === message.id)) draft.push(message);
          }));
          dispatch(chatsApi.util.updateQueryData('getChats', undefined, (draft) => {
            const chat = draft.find(c => c.id === message.chatId);
            if (chat) chat.lastMessage = message;
          }));
        });

        await cacheEntryRemoved;
        socket.disconnect();
      },
    }),
    updateAvatar: builder.mutation<Profile, { avatarUrl: string }>({
      query: (body) => ({
        url: '/profile/me/avatar',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'Profile', id: 'ME' }],
    }),
    updateProfile: builder.mutation<Profile, UpdateProfileDto>({
        query: (body) => ({
            url: '/profile/me',
            method: 'PATCH',
            body,
        }),
        invalidatesTags: [{ type: 'Profile', id: 'ME' }],
    }),
    searchUsers: builder.query<Profile[], string>({
      query: (q) => `/profile/search?q=${q}`,
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateAvatarMutation,
  useUpdateProfileMutation, // <-- ДОБАВЛЕНО
  useSearchUsersQuery, // <-- ВОТ ЭТА СТРОКА БЫЛА ПРОПУЩЕНА
} = profileApi;