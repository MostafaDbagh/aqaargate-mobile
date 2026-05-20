import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Pressable } from 'react-native';

import { TextField } from './text-field';

type Props<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
};

export function PasswordField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
}: Props<T>) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      name={name}
      control={control}
      label={label}
      placeholder={placeholder}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoComplete="password"
      textContentType="password"
      rightSlot={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={8}
          accessibilityRole="button"
          className="p-2">
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#6b7280"
          />
        </Pressable>
      }
    />
  );
}
