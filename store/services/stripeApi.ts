// store/services/stripeApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQueryWithReauth';

type CheckoutSessionResponse = {
  url: string;
};

export const stripeApi = createApi({
  reducerPath: 'stripeApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation<CheckoutSessionResponse, void>({
      query: () => ({
        url: '/stripe/create-checkout-session',
        method: 'POST',
      }),
    }),
  }),
});

export const { useCreateCheckoutSessionMutation } = stripeApi;