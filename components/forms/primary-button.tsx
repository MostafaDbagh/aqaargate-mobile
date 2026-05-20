import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  loading?: boolean;
  variant?: Variant;
  fullWidth?: boolean;
} & Omit<PressableProps, 'children'>;

const VARIANTS: Record<Variant, { container: string; text: string; spinner: string }> = {
  primary: {
    container: 'bg-brand-accent active:opacity-80',
    text: 'text-white',
    spinner: '#fff',
  },
  secondary: {
    container: 'bg-brand active:opacity-80',
    text: 'text-white',
    spinner: '#fff',
  },
  ghost: {
    container: 'bg-transparent active:opacity-60',
    text: 'text-brand-accent',
    spinner: '#e94545',
  },
};

export function PrimaryButton({
  label,
  loading,
  disabled,
  variant = 'primary',
  fullWidth = true,
  ...rest
}: Props) {
  const v = VARIANTS[variant];
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'opacity-50' : '';
  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      className={`${widthClass} ${v.container} ${disabledClass} rounded-xl py-3.5 flex-row items-center justify-center`}>
      {loading ? (
        <ActivityIndicator color={v.spinner} />
      ) : (
        <Text className={`${v.text} font-semibold text-base`}>{label}</Text>
      )}
    </Pressable>
  );
}
