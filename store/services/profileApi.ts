// store/services/profileApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { Profile } from '@/types/chat';
import { baseQueryWithReauth } from '../baseQueryWithReauth';

type UpdateProfileDto = {
    username?: string;
    settings?: {
        theme: string;
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