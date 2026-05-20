import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

type Props<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
};

export function CheckboxField<T extends FieldValues>({ name, control, label }: Props<T>) {
  const { t } = useTranslation();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const checked = !!value;
        return (
          <View className="mb-4">
            <Pressable
              onPress={() => onChange(!checked)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              className="flex-row items-start gap-3">
              <View
                className={`w-5 h-5 rounded border items-center justify-center mt-0.5 ${
                  checked ? 'bg-brand-accent border-brand-accent' : 'bg-white border-gray-300'
                }`}>
                {checked ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
              </View>
              <Text className="flex-1 text-gray-700 text-sm">{label}</Text>
            </Pressable>
            {error?.message ? (
              <Text className="text-red-500 text-xs mt-1 ml-8">
                {t(error.message as string)}
              </Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}
