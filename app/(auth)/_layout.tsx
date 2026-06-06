import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        // The (auth) group is itself presented as a modal from the root stack,
        // so the screens *inside* it must NOT re-present as `modal` — iOS's
        // pageSheet style keeps the presenter visible behind, which stacked the
        // register screen behind the OTP sheet. `fullScreenModal` slides up the
        // same way but fully covers the previous step (register → otp,
        // forgot-password → otp, login → forgot-password, otp → new-password).
        presentation: 'fullScreenModal',
        headerShown: false,
        animation: 'slide_from_bottom',
        contentStyle: { backgroundColor: '#f8fafc' },
      }}
    />
  );
}
