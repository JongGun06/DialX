// store/slices/presenceSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

type PresenceState = {
  onlineUserIds: string[];
};

const initialState: PresenceState = {
  onlineUserIds: [],
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    // Устанавливает первоначальный список при подключении
    setInitialOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUserIds = action.payload;
    },
    // Добавляет пользователя, который вошел в сеть
    userCameOnline: (state, action: PayloadAction<string>) => {
      if (!state.onlineUserIds.includes(action.payload)) {
        state.onlineUserIds.push(action.payload);
      }
    },
    // Убирает пользователя, который вышел из сети
    userWentOffline: (state, action: PayloadAction<string>) => {
      state.onlineUserIds = state.onlineUserIds.filter(
        (id) => id !== action.payload
      );
    },
  },
});

export const { setInitialOnlineUsers, userCameOnline, userWentOffline } = presenceSlice.actions;

export default presenceSlice.reducer;

// Селектор для получения всего списка
export const selectOnlineUserIds = (state: RootState) => state.presence.onlineUserIds;