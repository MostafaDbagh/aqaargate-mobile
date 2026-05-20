import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '@/apis/auth';

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAgent: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isAgent: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isAgent = action.payload.user?.role === 'agent';
    },
    updateUserRole: (state, action: PayloadAction<User['role']>) => {
      if (state.user) {
        state.user.role = action.payload;
        state.isAgent = action.payload === 'agent';
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        state.isAgent = state.user.role === 'agent';
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAgent = false;
    },
  },
});

export const { setCredentials, updateUserRole, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
