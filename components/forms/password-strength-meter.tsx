import { useWatch, type Control, type FieldValues, type Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

/** Per-segment colours: red → amber → yellow → green (filled left-to-right). */
const SEGMENT_COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e'];
const LABEL_KEYS = ['weak', 'fair', 'good', 'strong'] as const;

/** 0–4 heuristic: length tiers + character-class variety. */
function scorePassword(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

/**
 * Password strength meter — four bars that fill and colour-shift as the watched
 * field grows stronger, with a matching label (Weak / Fair / Good / Strong).
 * Renders nothing until the user types.
 */
export function PasswordStrengthMeter<T extends FieldValues>({ control, name }: Props<T>) {
  const { t } = useTranslation();
  const password = (useWatch({ control, name }) as string | undefined) ?? '';

  if (!password) return null;

  const score = scorePassword(password);
  const labelColor = SEGMENT_COLORS[Math.max(0, score - 1)];

  return (
    <View className="-mt-2 mb-4">
      <View className="flex-row gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className="flex-1 h-1.5 rounded-full"
            style={{ backgroundColor: i < score ? SEGMENT_COLORS[i] : '#e5e7eb' }}
          />
        ))}
      </View>
      {score > 0 ? (
        <Text className="text-xs font-semibold mt-1 self-end" style={{ color: labelColor }}>
          {t(`register.passwordStrength.${LABEL_KEYS[score - 1]}`)}
        </Text>
      ) : null}
    </View>
  );
}
