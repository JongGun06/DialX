// store/index.ts

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './services/authApi';
import { chatsApi } from './services/chatsApi';
import { profileApi } from './services/profileApi';
import { filesApi } from './services/filesApi';
import { aiCharactersApi } from './services/aiCharactersApi';
import { stripeApi } from './services/stripeApi'; // <-- ДОБАВЛЕНО
import authReducer, { logout } from './slices/authSlice';
import presenceReducer from './slices/presenceSlice'; // <-- ДОБАВЛЕНО


const appReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [chatsApi.reducerPath]: chatsApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [filesApi.reducerPath]: filesApi.reducer,
  [aiCharactersApi.reducerPath]: aiCharactersApi.reducer,
  [stripeApi.reducerPath]: stripeApi.reducer, // <-- ДОБАВЛЕНО
  auth: authReducer,
  presence: presenceReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === logout.type) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      chatsApi.middleware,
      profileApi.middleware,
      filesApi.middleware,
      aiCharactersApi.middleware,
      stripeApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;