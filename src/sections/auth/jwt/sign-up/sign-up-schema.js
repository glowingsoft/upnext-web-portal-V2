import { isValidPhoneNumber } from 'react-phone-number-input/input';
import { z as zod } from 'zod';
import { schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------
// Create Account Schema (Step 1 — credentials only)
export const CreateAccountSchema = zod
  .object({
    role: zod.enum(['customer', 'provider']).default('customer'),
    avatarUrl: zod
      .any()
      .nullable()
      .refine((value) => value !== null && value !== '', { message: 'Profile image is required!' }),
    fullName: zod.string().trim().min(1, { message: 'Full name is required!' }),
    email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Email must be a valid email address!' }),
    phoneNumber: schemaHelper.phoneNumber({ isValidPhoneNumber }),
    password: zod.string().min(1, { message: 'Password is required!' }).min(6, { message: 'Password must be at least 6 characters!' }),
    confirmPassword: zod.string().min(1, { message: 'Confirm password is required!' }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Passwords do not match!',
        path: ['confirmPassword'],
      });
    }
  });

export const createAccountDefaultValues = {
  role: 'customer',
  avatarUrl: null,
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
};

// ----------------------------------------------------------------------
// Customer Profile Schema (complete-profile stepper — customers only)
export const CustomerProfileSchema = zod
  .object({
    locationAddress: zod.string().min(1, { message: 'Location is required!' }),
    categories: zod.array(zod.any()).min(1, { message: 'Select at least one category!' }),
    description: zod.string().min(1, { message: 'Description is required!' }).max(200),
  })
  .passthrough();

export const customerProfileDefaultValues = {
  locationAddress: '',
  categories: [],
  description: '',
};

// ----------------------------------------------------------------------
// Provider Profile Schema (complete-profile stepper — providers only)
export const ProviderProfileSchema = zod
  .object({
    // Step 0 — Business
    businessImage: zod
      .any()
      .nullable()
      .refine((v) => v !== null && v !== undefined && v !== '', { message: 'Business image is required!' }),
    businessCoverImage: zod
      .any()
      .nullable()
      .refine((v) => v !== null && v !== undefined && v !== '', { message: 'Business cover image is required!' }),
    businessName: zod.string().min(1, { message: 'Business name is required!' }),
    businessType: zod.enum(['solo', 'team']).default('solo'),

    businessSize: zod.union([zod.string(), zod.number()]).optional(),
    experience: zod.union([zod.string(), zod.number()]).refine((v) => v !== null && v !== undefined && String(v).trim() !== '' && Number(v) !== 0, {
      message: 'Years of experience is required!',
    }),

    // Step 1 — Details
    location: zod.string().min(1, { message: 'Business location is required!' }),
    categories: zod.array(zod.any()).min(1, { message: 'Select at least one category!' }),
    tags: zod.array(zod.any()).optional().default([]),
    certifications: zod.any().nullable().optional(),
    certificationFile: zod.any().nullable().optional(),
    skills: zod
      .array(zod.string())
      .min(1, { message: 'Add at least one skill.' })
      .max(10, { message: 'You can add up to 10 skills.' })
      .default([]),
    description: zod.string().min(1, { message: 'Business description is required!' }).max(1000, { message: 'Description must be 1000 characters or less.' }),

    // Step 3 — Social (all optional)
    instagram: zod.string().optional(),
    facebook: zod.string().optional(),
    linkedin: zod.string().optional(),
    website: zod.string().optional(),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    const size = data.businessSize;
    if (data.businessType === 'team' && (size === null || size === undefined || String(size).trim() === '' || Number(size) === 0)) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Team size is required!',
        path: ['businessSize'],
      });
    }
  });

export const providerProfileDefaultValues = {
  businessImage: null,
  businessCoverImage: null,
  businessName: '',
  businessType: 'solo',
  businessSize: '',
  experience: '',
  location: '',
  categories: [],
  tags: [],
  certifications: null,
  certificationFile: null,
  skills: [],
  description: '',
  instagram: '',
  facebook: '',
  linkedin: '',
  website: '',
};
