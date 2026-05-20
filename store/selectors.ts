import type { RootState } from './store';

export const selectCurrentUser = (s: RootState) => s.auth.user;
export const selectCurrentToken = (s: RootState) => s.auth.token;
export const selectIsAuthenticated = (s: RootState) => s.auth.isAuthenticated;
export const selectIsAgent = (s: RootState) => s.auth.isAgent;
export const selectUserDisplayName = (s: RootState) =>
  s.auth.user?.username ?? 'Guest';
