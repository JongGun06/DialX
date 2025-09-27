// store/slices/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { AuthResponse } from '@/types/auth';
import { Profile } from '@/types/chat';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null; // <-- ДОБАВЛЕНО
  isLoggedIn: boolean;
  currentUser: Profile | null;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null, // <-- ДОБАВЛЕНО
  isLoggedIn: false,
  currentUser: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken; // <-- ДОБАВЛЕНО
      state.isLoggedIn = true;
    },
    setCurrentUser: (state, action: PayloadAction<Profile>) => {
      state.currentUser = action.payload;
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null; // <-- ДОБАВЛЕНО
      state.currentUser = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setCredentials, setCurrentUser, logout } = authSlice.actions;

export default authSlice.reducer;

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectCurrentUser = (state: RootState) => state.auth.currentUser;

export const selectAccessToken = (state: RootState) => state.auth.accessToken;
