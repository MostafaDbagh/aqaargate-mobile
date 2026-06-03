import { View } from 'react-native';

/**
 * Progress dots for the onboarding carousel. The active slide is a wide
 * primary pill; the rest are small faded dots — matching the reference flow.
 *
 * Order stays physical-LTR for both locales because the carousel itself scrolls
 * LTR (the app never force-flips layout via I18nManager), so the filled dot
 * always tracks the visible slide.
 */
export function OnboardingDots({ count, index }: { count: number; index: number }) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className={`h-2 rounded-full ${i === index ? 'w-6 bg-primary' : 'w-2 bg-primary-300'}`}
        />
      ))}
    </View>
  );
}
