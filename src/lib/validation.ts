import { z } from 'zod';

export const nameRules = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters');

export const usernameRules = z
  .string()
  .min(2, 'Username must be at least 2 characters')
  .max(50, 'Username must be at most 50 characters')
  .regex(/^(?!\.)/, { message: 'Username cannot start with a dot' })
  .regex(/(?<!\.)$/, { message: 'Username cannot end with a dot' })
  .regex(/^(?!.*\.\.)/, { message: 'Username cannot contain consecutive dots' })
  .regex(/^[a-zA-Z0-9._]+$/, {
    message: 'Username can only contain letters, numbers, underscores, and dots',
  });

export const emailRules = z.email('Please enter a valid email').max(255, 'Email must not exceed 255 characters');

export const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(255, 'Password must not exceed 255 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');
