import { z } from 'zod';

export const emailField = z.string().trim().email('errors.emailInvalid');
export const passwordField = z.string().min(6, 'errors.passwordMinLength');
export const usernameField = z.string().trim().min(3, 'errors.usernameMinLength');

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'errors.passwordRequired'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: usernameField,
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'errors.confirmRequired'),
    agreeToTerms: z.literal(true, { message: 'errors.mustAgreeToTerms' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'errors.passwordsNotMatch',
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'errors.invalidOTPFormat'),
});
export type OtpInputData = z.infer<typeof otpSchema>;

export const newPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, 'errors.confirmRequired'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'errors.passwordsNotMatch',
  });
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'errors.passwordRequired'),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, 'errors.confirmRequired'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'errors.passwordsNotMatch',
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
