// store/services/chatsApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { Chat, Message } from '@/types/chat';
import { baseQueryWithReauth } from '../baseQueryWithReauth';

export const chatsApi = createApi({
  reducerPath: 'chatsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Chat', 'Message'],
  endpoints: (builder) => ({
    getChats: builder.query<Chat[], void>({
      query: () => '/chats',
      transformResponse: (response: any[]) => {
        // "Нормализуем" ответ от сервера, чтобы убрать лишнюю вложенность
        return response.map(chat => ({
          ...chat,
          participants: chat.participants.map((p: any) => p.profile),
        }));
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Chat' as const, id })),
              { type: 'Chat', id: 'LIST' },
            ]
          : [{ type: 'Chat', id: 'LIST' }],
    }),
    getMessages: builder.query<Message[], string>({
      query: (chatId) => `/chats/${chatId}/messages`,
      providesTags: (result, error, id) => [{ type: 'Message', id }],
    }),
    sendMessage: builder.mutation<Message, { chatId: string; content?: string; fileUrl?: string }>({
      query: ({ chatId, ...body }) => ({
        url: `/chats/${chatId}/messages`,
        method: 'POST',
        body,
      }),
      async onQueryStarted({ chatId, ...patch }, { dispatch, queryFulfilled, getState }) {
        const currentUser = (getState() as any).auth.currentUser;
        if (!currentUser) return;

        const tempId = `temp_${Date.now()}`;
        const patchResult = dispatch(
          chatsApi.util.updateQueryData('getMessages', chatId, (draft) => {
            draft.push({
              id: tempId,
              content: patch.content,
              fileUrl: patch.fileUrl,
              createdAt: new Date().toISOString(),
              author: currentUser,
              chatId: chatId, // <-- ИСПРАВЛЕНИЕ ЗДЕСЬ
            });
          })
        );
        try {
          const { data: sentMessage } = await queryFulfilled;
          dispatch(
            chatsApi.util.updateQueryData('getMessages', chatId, (draft) => {
              const index = draft.findIndex((msg) => msg.id === tempId);
              if (index !== -1) {
                draft[index] = sentMessage;
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
    createGroupChat: builder.mutation<Chat, { name: string; profileIds: string[] }>({
        query: (body) => ({
            url: '/chats/group',
            method: 'POST',
            body,
        }),
        invalidatesTags: [{ type: 'Chat', id: 'LIST' }],
    }),
    getChatDetails: builder.query<Chat, string>({
        query: (chatId) => `/chats/${chatId}`,
        providesTags: (result, error, id) => [{ type: 'Chat', id }],
    }),
    updateGroupAvatar: builder.mutation<Chat, { chatId: string; avatarUrl: string }>({
        query: ({ chatId, ...body }) => ({
            url: `/chats/${chatId}/avatar`,
            method: 'PATCH',
            body,
        }),
        invalidatesTags: (result, error, { chatId }) => [{ type: 'Chat', id: chatId }],
    }),
    addMembersToGroup: builder.mutation<Chat, { chatId: string; profileIds: string[] }>({
        query: ({ chatId, ...body }) => ({
            url: `/chats/${chatId}/members`,
            method: 'PATCH',
            body,
        }),
        invalidatesTags: (result, error, { chatId }) => [{ type: 'Chat', id: chatId }],
    }),
    removeMemberFromGroup: builder.mutation<Chat, { chatId: string; memberId: string }>({
        query: ({ chatId, memberId }) => ({
            url: `/chats/${chatId}/members/${memberId}`,
            method: 'DELETE',
        }),
        invalidatesTags: (result, error, { chatId }) => [{ type: 'Chat', id: chatId }],
    }),
    createOrFindPrivateChat: builder.mutation<Chat, { profileId: string }>({
        query: (body) => ({
            url: '/chats/private',
            method: 'POST',
            body,
        }),
        invalidatesTags: [{ type: 'Chat', id: 'LIST' }],
    }),
  }),
});

export const { 
    useGetChatsQuery, 
    useGetMessagesQuery, 
    useSendMessageMutation,
    useCreateGroupChatMutation,
    useGetChatDetailsQuery,
    useUpdateGroupAvatarMutation,
    useAddMembersToGroupMutation,
    useRemoveMemberFromGroupMutation,
    useCreateOrFindPrivateChatMutation,
} = chatsApi;