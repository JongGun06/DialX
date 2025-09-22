//store/services/filesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import axios, { AxiosError } from 'axios';
import { RootState } from '@/store';
import type {
  BaseQueryApi,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';
import { API_BASE_URL } from '@/constants/api'; // <-- ИЗМЕНЕНИЕ


type UploadResponse = {
  url: string;
  key: string;
};

export const filesApi = createApi({
  reducerPath: 'filesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    uploadFile: builder.mutation<UploadResponse, FormData>({
      queryFn: async (
        formData,
        { getState }: BaseQueryApi
      ): Promise<
        QueryReturnValue<
          UploadResponse,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >
      > => {
        const token = (getState() as RootState).auth.accessToken;
        if (!token) {
          return {
            error: { status: 401, data: 'Unauthorized' } as FetchBaseQueryError,
          };
        }

        try {
          const result = await axios.post<UploadResponse>(
            `${API_BASE_URL}/files/upload`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return { data: result.data };
        } catch (error) {
          const axiosError = error as AxiosError;
          return {
            error: {
              status: axiosError.response?.status ?? 500,
              data: axiosError.response?.data || axiosError.message,
            } as FetchBaseQueryError,
          };
        }
      },
    }),
  }),
});

export const { useUploadFileMutation } = filesApi;
