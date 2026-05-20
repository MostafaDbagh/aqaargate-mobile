import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

type Props<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  errorTKey?: string;
  rightSlot?: React.ReactNode;
  containerClassName?: string;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'>;

export function TextField<T extends FieldValues>({
  name,
  control,
  label,
  rightSlot,
  containerClassName = '',
  ...input
}: Props<T>) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
        const hasError = !!error?.message;
        const errorText = hasError ? t(error!.message as string) : '';
        const borderClass = hasError
          ? 'border-red-500'
          : focused
            ? 'border-brand-accent'
            : 'border-gray-200';

        return (
          <View className={`mb-4 ${containerClassName}`}>
            {label ? (
              <Text className="text-gray-700 text-sm font-medium mb-1.5">{label}</Text>
            ) : null}
            <View
              className={`flex-row items-center bg-white border ${borderClass} rounded-xl px-3`}>
              <TextInput
                {...input}
                value={(value as string | undefined) ?? ''}
                onChangeText={onChange}
                onFocus={(e) => {
                  setFocused(true);
                  input.onFocus?.(e);
                }}
                onBlur={() => {
                  setFocused(false);
                  onBlur();
                }}
                placeholderTextColor="#9ca3af"
                className="flex-1 py-3 text-base text-gray-900"
              />
              {rightSlot}
            </View>
            {hasError ? (
              <Text className="text-red-500 text-xs mt-1">{errorText}</Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}
