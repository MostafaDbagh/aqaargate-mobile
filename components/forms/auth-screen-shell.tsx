import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose?: () => void;
};

export function AuthScreenShell({ title, subtitle, children, onClose }: Props) {
  const router = useRouter();
  const handleClose = () => (onClose ? onClose() : router.back());

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <View className="flex-row items-center justify-between px-5 pt-2">
        <View className="w-10" />
        <Pressable
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={10}
          className="w-10 h-10 rounded-full items-center justify-center active:bg-gray-200">
          <Ionicons name="close" size={24} color="#111827" />
        </Pressable>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingTop: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}>
          <Text className="text-brand text-2xl font-bold">{title}</Text>
          {subtitle ? <Text className="text-gray-500 mt-1 mb-6">{subtitle}</Text> : null}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
