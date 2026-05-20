import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

const LENGTH = 6;

type Props<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  autoSubmit?: (otp: string) => void;
};

export function OtpInput<T extends FieldValues>({ name, control, autoSubmit }: Props<T>) {
  const { t } = useTranslation();
  const refs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const digits = ((value as string | undefined) ?? '').split('').slice(0, LENGTH);
        while (digits.length < LENGTH) digits.push('');

        const setDigit = (index: number, raw: string) => {
          const clean = raw.replace(/\D/g, '');
          if (clean.length > 1) {
            const merged = clean.slice(0, LENGTH);
            onChange(merged);
            if (merged.length === LENGTH) autoSubmit?.(merged);
            refs.current[Math.min(merged.length, LENGTH - 1)]?.focus();
            return;
          }
          const next = [...digits];
          next[index] = clean;
          const joined = next.join('').slice(0, LENGTH);
          onChange(joined);
          if (clean && index < LENGTH - 1) refs.current[index + 1]?.focus();
          if (joined.length === LENGTH) autoSubmit?.(joined);
        };

        const onKey = (index: number, key: string) => {
          if (key === 'Backspace' && !digits[index] && index > 0) {
            refs.current[index - 1]?.focus();
          }
        };

        return (
          <View className="mb-4">
            <View className="flex-row justify-between gap-2">
              {digits.map((d, i) => (
                <TextInput
                  key={i}
                  ref={(r) => {
                    refs.current[i] = r;
                  }}
                  value={d}
                  onChangeText={(v) => setDigit(i, v)}
                  onKeyPress={({ nativeEvent }) => onKey(i, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={LENGTH}
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  className={`flex-1 text-center text-xl font-semibold bg-white border ${
                    error ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl py-3 text-gray-900`}
                />
              ))}
            </View>
            {error?.message ? (
              <Text className="text-red-500 text-xs mt-2">
                {t(error.message as string)}
              </Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}
