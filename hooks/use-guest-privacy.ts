import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import type { ExtendedListing } from '@/apis/listing';
import { isAgentListing } from '@/lib/listing-privacy';
import { selectIsAuthenticated } from '@/store/selectors';
import { useAppSelector } from '@/store/store';

/**
 * Guest data-protection for property details — mobile mirror of the web
 * `components/propertyDetails/useGuestPrivacy.js`.
 *
 * For a NOT-logged-in visitor viewing an AGENT-published listing we hide the
 * exact address and lock the map (`isProtected`). Admin/platform listings stay
 * fully visible. The video is gated for ALL guests (`isGuest`), not just agent
 * listings. Agent contact stays fully visible to guests — matching web, where
 * the old phone-masking was removed.
 *
 * NOTE: frontend-only (cosmetic) — the public GET /listing/:id still returns
 * full data to anyone; to truly stop scraping the API must mask these fields
 * for unauthenticated requests.
 */
export function useGuestPrivacy(listing?: ExtendedListing | null) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isGuest = !isAuthenticated;
  const agentListing = isAgentListing(listing);
  // Protect only when a guest views an agent-published listing.
  const isProtected = isGuest && agentListing;

  const promptLogin = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  return { isGuest, isAgentListing: agentListing, isProtected, promptLogin };
}
