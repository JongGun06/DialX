// store/services/profileApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { Profile, Chat } from '@/types/chat'; // <-- Убедись, что Chat импортирован
import { baseQueryWithReauth } from '../baseQueryWithReauth';
import { RootState } from '..';
import { chatsApi } from './chatsApi';
import { initializeSocket, disconnectSocket } from '../socket';
import { setInitialOnlineUsers, userCameOnline, userWentOffline } from '../slices/presenceSlice';


type UpdateProfileDto = {
    username?: string;
    settings?: {
        theme: { [key: string]: string };
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
        
        if (token) {
          // Инициализируем сокет и получаем его единственный экземпляр
          const socket = initializeSocket(token);

          // --- ВСЕ ГЛОБАЛЬНЫЕ СЛУШАТЕЛИ ТЕПЕРЬ НАХОДЯТСЯ ЗДЕСЬ ---
          socket.on('connect', () => console.log(`[Socket] Глобальный сокет подключен! ID: ${socket.id}`));
          socket.on('disconnect', (reason) => console.log(`[Socket] Глобальный сокет отключен: ${reason}`));

          // Слушатель для новых чатов
          socket.on('newChat', (newChat: Chat) => {
            console.log('[Socket] 📩 ПОЛУЧЕН НОВЫЙ ЧАТ:', newChat);
            dispatch(
              chatsApi.util.updateQueryData('getChats', undefined, (draft) => {
                if (!draft.find((chat) => chat.id === newChat.id)) {
                  draft.unshift(newChat);
                }
              })
            );
          });
          socket.on('onlineUsersList', (userIds: string[]) => {
            console.log('[Socket] Получен список онлайн-пользователей:', userIds);
            dispatch(setInitialOnlineUsers(userIds));
          });
  
          socket.on('presenceUpdate', (data: { userId: string; status: 'online' | 'offline' }) => {
            console.log('[Socket] Получено обновление статуса:', data);
            const { userId, status } = data;
            if (status === 'online') {
              dispatch(userCameOnline(userId));
            } else {
              dispatch(userWentOffline(userId));
            }
          });

          // Слушатели для системы присутствия (онлайн-статус)
          socket.on('onlineUsersList', (userIds: string[]) => {
            console.log('[Socket] Получен список онлайн-пользователей:', userIds);
            dispatch(setInitialOnlineUsers(userIds));
          });
  
          socket.on('presenceUpdate', (data: { userId: string; status: 'online' | 'offline' }) => {
            console.log('[Socket] Получено обновление статуса:', data);
            const { userId, status } = data;
            if (status === 'online') {
              dispatch(userCameOnline(userId));
            } else {
              dispatch(userWentOffline(userId));
            }
          });
        }
        
        // При выходе из приложения или размонтировании компонента - отключаемся
        await cacheEntryRemoved;
        disconnectSocket();
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
  useUpdateProfileMutation,
  useSearchUsersQuery,
} = profileApi;
