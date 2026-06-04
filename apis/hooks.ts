import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import type { Listing } from '@/lib/api';
import { clearCredentials, persistCredentials } from '@/store/persist';
import { selectCompareItems, selectIsAuthenticated } from '@/store/selectors';
import {
  MAX_COMPARE,
  addToCompare,
  clearCompare,
  removeFromCompare,
} from '@/store/slices/compare-slice';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { agentAPI } from './agent';
import { authAPI, type OtpType, type SigninPayload, type SignupPayload } from './auth';
import { blogAPI, type BlogListParams } from './blog';
import { categoryAPI } from './category';
import { cityAPI } from './city';
import { favoriteAPI, extractFavoriteId } from './favorites';
import { listingAPI } from './listing';
import { projectAPI, type ProjectsQuery } from './project';
import { userAPI, type UpdateProfilePayload } from './user';

export function useAuth() {
  const qc = useQueryClient();

  const signup = useMutation({
    mutationFn: (payload: SignupPayload) => authAPI.signup(payload),
    onSuccess: async (data) => {
      if (data?.token && data?.user) {
        await persistCredentials(data.user, data.token);
      }
      qc.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const signin = useMutation({
    mutationFn: (payload: SigninPayload) => authAPI.signin(payload),
    onSuccess: async (data) => {
      if (data?.token && data?.user) {
        await persistCredentials(data.user, data.token);
      }
      qc.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const signout = useMutation({
    mutationFn: () => authAPI.signout(),
    onSettled: async () => {
      await clearCredentials();
      qc.clear();
    },
  });

  return { signup, signin, signout };
}

export function useSendOtp() {
  return useMutation({
    mutationFn: ({ email, type }: { email: string; type: OtpType }) =>
      authAPI.sendOTP(email, type),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, otp, type }: { email: string; otp: string; type: OtpType }) =>
      authAPI.verifyOTP(email, otp, type),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email, newPassword }: { email: string; newPassword: string }) =>
      authAPI.resetPassword(email, newPassword),
  });
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: () => userAPI.getProfile(userId as string),
    enabled: !!userId,
  });
}

export function useUpdateProfile(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userAPI.updateProfile(userId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'profile', userId] }),
  });
}

export function useChangePassword(userId: string) {
  return useMutation({
    mutationFn: (newPassword: string) => userAPI.changePassword(userId, newPassword),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getCategoryStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => cityAPI.getCityStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingAPI.getById(id as string),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => agentAPI.getAgents(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAgent(id: string | undefined) {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => agentAPI.getAgentById(id as string),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useListingsByAgent(
  agentId: string | undefined,
  params: { limit?: number; sort?: string } = {}
) {
  return useQuery({
    queryKey: ['listings', 'by-agent', agentId, params],
    queryFn: () => listingAPI.getByAgent(agentId as string, params),
    enabled: !!agentId,
    staleTime: 60 * 1000,
  });
}

export function useProjects(params: ProjectsQuery = {}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectAPI.getProjects(params),
    staleTime: 60 * 1000,
  });
}

export function useProject(identifier: string | undefined) {
  return useQuery({
    queryKey: ['project', identifier],
    queryFn: () => projectAPI.getProjectBySlugOrId(identifier as string),
    enabled: !!identifier,
    staleTime: 60 * 1000,
  });
}

// ---- Favorites (heart) ----

/** Set of favorited listing ids for the current user. Only fetches when signed in. */
export function useFavoriteIds() {
  const isAuthed = useAppSelector(selectIsAuthenticated);
  const query = useQuery({
    queryKey: ['favorites'],
    queryFn: favoriteAPI.list,
    enabled: isAuthed,
    staleTime: 60 * 1000,
  });
  const ids = useMemo(
    () =>
      new Set(
        (query.data ?? [])
          .map(extractFavoriteId)
          .filter((x): x is string => !!x)
      ),
    [query.data]
  );
  return { ids, isAuthed, ...query };
}

/** Toggle a listing's favorite status (add when not favorited, remove otherwise). */
export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, favorited }: { id: string; favorited: boolean }) =>
      favorited ? favoriteAPI.remove(id) : favoriteAPI.add(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

// ---- Blogs ----

const BLOG_PAGE_SIZE = 10;

/** Paginated published blogs with "load more" support. */
export function useBlogsInfinite(params: BlogListParams = {}) {
  return useInfiniteQuery({
    queryKey: ['blogs', 'infinite', params],
    queryFn: ({ pageParam }) =>
      blogAPI.list({ ...params, page: pageParam, limit: BLOG_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasNextPage ? last.pagination.page + 1 : undefined,
    staleTime: 2 * 60 * 1000,
  });
}

/** Single blog by Mongo id or (locale) slug. */
export function useBlog(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ['blog', idOrSlug],
    queryFn: () => blogAPI.getById(idOrSlug as string),
    enabled: !!idOrSlug,
    staleTime: 5 * 60 * 1000,
  });
}

// ---- Compare (max 3 listings, persisted) ----

export type ToggleCompareResult = { action: 'added' | 'removed' | 'limit' };

/**
 * Compare-selection helper. Mirrors the web CompareContext: add/remove/toggle a
 * listing, capped at MAX_COMPARE. Backed by the persisted redux `compare` slice.
 */
export function useCompare() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCompareItems);
  const ids = useMemo(() => new Set(items.map((i) => i._id)), [items]);

  const isInCompare = useCallback((id: string) => ids.has(id), [ids]);

  const toggle = useCallback(
    (listing: Listing): ToggleCompareResult => {
      if (ids.has(listing._id)) {
        dispatch(removeFromCompare(listing._id));
        return { action: 'removed' };
      }
      if (items.length >= MAX_COMPARE) return { action: 'limit' };
      dispatch(addToCompare(listing));
      return { action: 'added' };
    },
    [dispatch, ids, items.length]
  );

  const remove = useCallback((id: string) => dispatch(removeFromCompare(id)), [dispatch]);
  const clear = useCallback(() => dispatch(clearCompare()), [dispatch]);

  return { items, count: items.length, max: MAX_COMPARE, isInCompare, toggle, remove, clear };
}
