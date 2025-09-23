// store/slices/presenceSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

type PresenceState = {
  onlineUserIds: { [key: string]: boolean };
};

const initialState: PresenceState = {
  onlineUserIds: {},
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setInitialOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUserIds = {}; // Очищаем перед установкой
      action.payload.forEach(userId => {
        state.onlineUserIds[userId] = true;
      });
    },
    userCameOnline: (state, action: PayloadAction<string>) => {
      state.onlineUserIds[action.payload] = true;
    },
    userWentOffline: (state, action: PayloadAction<string>) => {
      delete state.onlineUserIds[action.payload];
    },
  },
});

export const { setInitialOnlineUsers, userCameOnline, userWentOffline } = presenceSlice.actions;
export default presenceSlice.reducer;
export const selectOnlineUserIds = (state: RootState) => state.presence.onlineUserIds;