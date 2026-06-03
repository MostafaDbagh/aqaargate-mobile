import { useRouter, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { hasSeenOnboarding } from '@/lib/onboarding';

const ONBOARDING_HREF = '/onboarding' as Href;

/**
 * First-run gate. Reads the "seen" flag once on mount and, for new installs,
 * redirects to the onboarding carousel. Returns `booting` while the async read
 * is in flight so the root layout can hold an opaque cover over the navigator
 * and avoid a one-frame flash of the tabs before the redirect lands.
 */
export function useOnboardingGate(): boolean {
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    let active = true;
    (async () => {
      const seen = await hasSeenOnboarding();
      if (!active) return;
      if (!seen) router.replace(ONBOARDING_HREF);
      setBooting(false);
    })();

    return () => {
      active = false;
    };
  }, [router]);

  return booting;
}
