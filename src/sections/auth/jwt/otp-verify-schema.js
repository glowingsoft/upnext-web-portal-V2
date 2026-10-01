import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const OtpVerifySchema = zod.object({
  otp: zod
    .string()
    .min(1, { message: 'OTP is required!' })
    .regex(/^\d{6}$/, { message: 'OTP must be a 6-digit number!' }),
});
