import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const appLogo = require('../../assets/images/icon.png');

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
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
      {/* Close */}
      <View className="flex-row items-center justify-end px-5 pt-1">
        <Pressable
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={10}
          className="w-10 h-10 rounded-full items-center justify-center active:bg-gray-100">
          <Ionicons name="close" size={22} color="#2c2e33" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}>
          {/* Brand header — centered */}
          <View className="items-center mb-8">
            <Image
              source={appLogo}
              style={{ width: 92, height: 92, marginBottom: 14 }}
              resizeMode="contain"
            />
            <Text className="text-heading text-[28px] leading-9 font-bold text-center tracking-tight">
              {title}
            </Text>
            {subtitle ? (
              <Text className="text-note text-[15px] leading-6 text-center mt-2 px-3">
                {subtitle}
              </Text>
            ) : null}
          </View>

          {/* Form */}
          <View className="w-full">{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
