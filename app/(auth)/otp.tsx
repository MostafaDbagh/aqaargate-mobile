import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { useAuth, useSendOtp, useVerifyOtp } from '@/apis/hooks';
import type { OtpType } from '@/apis/auth';
import { AuthScreenShell } from '@/components/forms/auth-screen-shell';
import { OtpInput } from '@/components/forms/otp-input';
import { PrimaryButton } from '@/components/forms/primary-button';
import { useStatusModal } from '@/components/feedback/status-modal';
import { useToast } from '@/components/feedback/toast';
import { getApiErrorMessage } from '@/lib/api';
import { otpSchema, type OtpInputData } from '@/lib/schemas';

// The success dialog is a root-level overlay (see status-modal.tsx), not a
// UIKit <Modal>, so it no longer races iOS modal presentation. We still wait
// out the (auth) modal's ~0.5s dismiss so the overlay isn't revealed behind a
// still-sliding sheet — purely cosmetic now, not a correctness crutch.
const SUCCESS_MODAL_DELAY_MS = 500;

export default function OtpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{
    type: OtpType;
    email: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>();
  const type = (params.type ?? 'signup') as OtpType;
  const email = params.email ?? '';

  const verifyOtp = useVerifyOtp();
  const sendOtp = useSendOtp();
  const { signup, signin } = useAuth();
  const status = useStatusModal();

  const { control, handleSubmit, setError, clearErrors, watch } = useForm<OtpInputData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const isForgot = type === 'forgot_password';

  // The OTP is single-use; remember which exact code the server already verified
  // so a retry (e.g. after a signup failure) skips re-verifying a consumed code.
  const verifiedCodeRef = useRef<string | null>(null);

  // Clear the inline error the moment the user edits the code, so the red boxes
  // and error span don't linger with stale digits while it's being corrected.
  const otpValue = watch('otp');
  useEffect(() => {
    clearErrors('otp');
  }, [otpValue, clearErrors]);

  const submitVerified = async (otp: string) => {
    // The auto-submit path calls this directly (not via handleSubmit), so guard
    // against overlapping runs: without this, editing the code back to 6 digits
    // while a request is in flight would fire a duplicate verify/signup.
    if (verifyOtp.isPending || signup.isPending || signin.isPending) return;

    // Any failure on this screen is recoverable in place, so surface it as an
    // inline error span under the code inputs (an RHF field error → OtpInput
    // renders the message + turns the boxes red) and keep the user on the OTP
    // screen. We only leave the screen on a fully successful verify (+ signup).
    clearErrors('otp');

    // Step 1 — verify the code. Skip re-verifying a code we already verified
    // (the OTP is single-use): on a retry after a signup failure, re-verifying
    // the consumed code would fail and clobber the real (signup) error.
    if (verifiedCodeRef.current !== otp) {
      try {
        await verifyOtp.mutateAsync({ email, otp, type });
        verifiedCodeRef.current = otp;
      } catch (err) {
        setError('otp', {
          message: getApiErrorMessage(err, t('otpVerification.verificationFailed')),
        });
        return;
      }
    }

    if (isForgot) {
      router.replace({ pathname: '/(auth)/new-password', params: { email } });
      return;
    }

    // Step 2 — code is valid, create the account. The OTP screen must stay
    // mounted while the request runs — unmounting it (via a dismiss) tears down
    // the React Query mutation and the promise never resolves. So: await signup
    // first. On success, close the auth flow back to the app and report it with
    // the global status modal (mounted at the root, so it sits over the app, not
    // behind the auth stack), offering Log in / Close. On failure, stay on the
    // screen and show the inline error span so the user can retry or resend.
    //
    // `dismissTo('/(tabs)')` lands us on the home tabs deterministically. Signup
    // reached this screen via register → otp with `replace`, so the auth stack is
    // just [otp] — but dismissTo (vs. back()/dismiss()) keeps this correct no
    // matter how the modal was entered.
    try {
      await signup.mutateAsync({
        username: params.username ?? '',
        email,
        password: params.password ?? '',
        confirmPassword: params.confirmPassword ?? '',
        agreeToTerms: true,
        role: 'user',
      });
    } catch (err) {
      setError('otp', {
        message: getApiErrorMessage(err, t('registrationSuccess.failedMessage')),
      });
      return;
    }

    // Step 3 — auto-login the freshly-created user so they don't have to retype
    // their credentials on the login screen. signin has no server-side email-
    // verification gate, so the just-created account authenticates immediately;
    // the signin mutation persists the token/session on success. If it fails
    // (e.g. a network blip), fall back to the manual Log in button below.
    // (This screen only ever registers role:'user', so it's users-only.)
    let loggedIn = false;
    try {
      await signin.mutateAsync({ email, password: params.password ?? '' });
      loggedIn = true;
    } catch {
      // keep loggedIn=false → success modal offers the Log in button
    }

    router.dismissTo('/(tabs)');
    // Show AFTER the (auth) modal's dismiss transition settles so the root
    // overlay isn't revealed behind a still-sliding sheet. status.success
    // targets the root provider (still mounted after this screen unmounts), so
    // the timer is safe.
    setTimeout(() => {
      status.success({
        title: t('registrationSuccess.title'),
        message: t('registrationSuccess.message'),
        email,
        buttons: loggedIn
          ? [
              {
                // Already authenticated — just dismiss back into the app.
                label: t('globalStatus.close'),
                variant: 'primary',
              },
            ]
          : [
              {
                label: t('globalStatus.login'),
                variant: 'primary',
                // push (not replace): the auth flow was already dismissed above, so
                // this opens login over the tabs and keeps (tabs) underneath — so
                // login's dismissAll() returns the user to the app after signing in.
                onPress: () => router.push('/(auth)/login'),
              },
              {
                // Auth flow is already dismissed; this just closes the modal.
                label: t('globalStatus.close'),
                variant: 'secondary',
              },
            ],
      });
    }, SUCCESS_MODAL_DELAY_MS);
  };

  const onSubmit = handleSubmit((values) => submitVerified(values.otp));

  const onResend = async () => {
    try {
      await sendOtp.mutateAsync({ email, type });
      verifiedCodeRef.current = null; // a fresh code invalidates any prior verification
      toast.success(t('otpVerification.resentToast'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('errors.generic')));
    }
  };

  const title = isForgot
    ? t('otpVerification.titleForgotPassword')
    : t('otpVerification.title');
  const submitLabel = isForgot
    ? t('otpVerification.verifyAndReset')
    : t('otpVerification.verifyAndComplete');
  const busy = verifyOtp.isPending || signup.isPending || signin.isPending;

  return (
    <AuthScreenShell
      title={title}
      subtitle={t('otpVerification.sentCode', { email })}
      // Signup reached this screen via register → otp with `replace`, so there's
      // no register screen left underneath to fall back to — closing returns to
      // login. Forgot-password still has its own screen below in the stack, so it
      // keeps the default back() (→ forgot-password to re-enter the email).
      onClose={isForgot ? undefined : () => router.replace('/(auth)/login')}>
      <Text className="text-gray-700 mb-3">{t('otpVerification.enterCode')}</Text>
      <OtpInput
        control={control}
        name="otp"
        autoSubmit={(code) => submitVerified(code)}
      />

      <PrimaryButton
        label={busy ? t('otpVerification.verifying') : submitLabel}
        loading={busy}
        onPress={onSubmit}
      />

      <View className="flex-row justify-center mt-6 gap-1">
        <Text className="text-gray-500">{t('otpVerification.didntReceive')}</Text>
        <Pressable onPress={onResend} disabled={sendOtp.isPending}>
          <Text className="text-brand-accent font-semibold">
            {sendOtp.isPending ? t('otpVerification.resending') : t('otpVerification.resendCode')}
          </Text>
        </Pressable>
      </View>
    </AuthScreenShell>
  );
}
