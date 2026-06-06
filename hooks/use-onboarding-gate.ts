import { useNavigationContainerRef, useRouter, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { hasSeenOnboarding } from '@/lib/onboarding';

const ONBOARDING_HREF = '/onboarding' as Href;

/**
 * First-run gate. Reads the "seen" flag once on mount and, for new installs,
 * redirects to the onboarding carousel. Returns `booting` while the async read
 * is in flight so the root layout can hold an opaque cover over the navigator
 * and avoid a one-frame flash of the tabs before the redirect lands.
 *
 * In development (`__DEV__`) the carousel is shown on every launch so the flow
 * can be iterated on; in production it stays a once-per-install gate.
 */
export function useOnboardingGate(): boolean {
  const router = useRouter();
  // The root navigation container (a stable singleton ref). Its state can carry
  // a `key` *before* the container is actually ready to accept actions (notably
  // on Fast Refresh, where the nav state persists while the <Stack> remounts),
  // so gating on the state still throws "Attempted to navigate before mounting
  // the Root Layout component". `isReady()` is the authoritative signal — we
  // poll it across frames rather than subscribing to `state`, because a `state`
  // listener that calls setState feeds back into the navigator's own re-renders
  // and trips "Maximum update depth exceeded".
  const navRef = useNavigationContainerRef();
  const [booting, setBooting] = useState(true);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    let active = true;
    let frame: ReturnType<typeof requestAnimationFrame> | undefined;

    const tryGate = () => {
      if (!active) return;
      // Hold the cover until the navigator can truly handle navigation.
      if (!navRef.isReady()) {
        frame = requestAnimationFrame(tryGate);
        return;
      }
      handled.current = true;

      (async () => {
        // Dev builds always replay onboarding; prod respects the persisted flag.
        const seen = __DEV__ ? false : await hasSeenOnboarding();
        if (!active) return;
        if (!seen) {
          // Defer the redirect one extra frame past `isReady()`. Replacing the
          // route synchronously with the navigator's first commit lets
          // react-navigation's `useSyncState` feed back into its own render and
          // trip "Maximum update depth exceeded" (intermittently, as a race).
          // Waiting a frame lets that first commit settle before we navigate.
          frame = requestAnimationFrame(() => {
            if (!active) return;
            router.replace(ONBOARDING_HREF);
            setBooting(false);
          });
          return;
        }
        setBooting(false);
      })();
    };

    tryGate();

    return () => {
      active = false;
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [router, navRef]);

  return booting;
}
