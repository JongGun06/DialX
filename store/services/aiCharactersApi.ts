// store/services/aiCharactersApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { AiCharacter } from '@/types/ai';
import { Message } from '@/types/chat';
import { baseQueryWithReauth } from '../baseQueryWithReauth'; // <-- ИЗМЕНЕНИЕ

type CreateAiCharacterDto = {
  name: string;
  persona: string;
  avatarUrl?: string;
};

export const aiCharactersApi = createApi({
  reducerPath: 'aiCharactersApi',
  baseQuery: baseQueryWithReauth, // <-- ИЗМЕНЕНИЕ
  tagTypes: ['AiCharacter', 'AiMessage'],
  endpoints: (builder) => ({
    getAiCharacters: builder.query<AiCharacter[], void>({
      query: () => '/ai-characters',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AiCharacter' as const, id })),
              { type: 'AiCharacter', id: 'LIST' },
            ]
          : [{ type: 'AiCharacter', id: 'LIST' }],
    }),
    createAiCharacter: builder.mutation<AiCharacter, CreateAiCharacterDto>({
      query: (body) => ({
        url: '/ai-characters',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AiCharacter', id: 'LIST' }],
    }),
    getAiMessages: builder.query<Message[], string>({
      query: (characterId) => `/ai-characters/${characterId}/messages`,
      providesTags: (result, error, id) => [{ type: 'AiMessage', id }],
    }),
  }),
});

export const {
  useGetAiCharactersQuery,
  useCreateAiCharacterMutation,
  useGetAiMessagesQuery,
} = aiCharactersApi;