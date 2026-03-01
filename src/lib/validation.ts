import { z } from 'zod';
import { ARTWORK_GENRES, ARTWORK_TECHNIQUES, ArtworkType, Visibility } from '@/types/artwork.types';

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

export const CURRENT_YEAR = new Date().getFullYear();
export const MAX_TITLE_LENGTH = 255;
export const MAX_TAGS = 50;
export const MAX_TAG_LENGTH = 100;
export const MAX_ARTWORK_TECHNIQUES = 5;
export const MAX_ARTWORK_GENRES = 5;

export const artworkFormSchema = z
  .object({
    type: z.enum([ArtworkType.DIGITAL, ArtworkType.PHYSICAL]),
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(MAX_TITLE_LENGTH, `Title must be at most ${MAX_TITLE_LENGTH} characters`),
    description: z.string(),
    year: z.string(),
    technique: z
      .array(z.enum(ARTWORK_TECHNIQUES))
      .max(MAX_ARTWORK_TECHNIQUES, `Technique must have at most ${MAX_ARTWORK_TECHNIQUES} items`),
    genre: z
      .array(z.enum(ARTWORK_GENRES))
      .max(MAX_ARTWORK_GENRES, `Genre must have at most ${MAX_ARTWORK_GENRES} items`),
    physicalHeight: z.string(),
    physicalWidth: z.string(),
    physicalDepth: z.string(),
    digitalHeight: z.string(),
    digitalWidth: z.string(),
    fileSize: z.string(),
    materials: z.string(),
    tools: z.string(),
    visibility: z.enum([Visibility.PUBLIC, Visibility.PRIVATE]),
    collectionId: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.year) {
      const yearNum = Number(data.year);
      if (!Number.isInteger(yearNum) || yearNum < 1 || yearNum > CURRENT_YEAR) {
        ctx.addIssue({
          code: 'custom',
          path: ['year'],
          message: `Year must be between 1 and ${CURRENT_YEAR}`,
        });
      }
    }

    if (data.type === ArtworkType.PHYSICAL) {
      if (data.physicalHeight && (isNaN(Number(data.physicalHeight)) || Number(data.physicalHeight) < 0)) {
        ctx.addIssue({
          code: 'custom',
          path: ['physicalHeight'],
          message: 'Must be a positive number',
        });
      }
      if (data.physicalWidth && (isNaN(Number(data.physicalWidth)) || Number(data.physicalWidth) < 0)) {
        ctx.addIssue({
          code: 'custom',
          path: ['physicalWidth'],
          message: 'Must be a positive number',
        });
      }
      if (data.physicalDepth && (isNaN(Number(data.physicalDepth)) || Number(data.physicalDepth) < 0)) {
        ctx.addIssue({
          code: 'custom',
          path: ['physicalDepth'],
          message: 'Must be a positive number',
        });
      }
    }

    if (data.type === ArtworkType.DIGITAL) {
      if (data.digitalHeight && (!Number.isInteger(Number(data.digitalHeight)) || Number(data.digitalHeight) < 0)) {
        ctx.addIssue({
          code: 'custom',
          path: ['digitalHeight'],
          message: 'Must be a positive integer',
        });
      }
      if (data.digitalWidth && (!Number.isInteger(Number(data.digitalWidth)) || Number(data.digitalWidth) < 0)) {
        ctx.addIssue({
          code: 'custom',
          path: ['digitalWidth'],
          message: 'Must be a positive integer',
        });
      }
      if (data.fileSize && (isNaN(Number(data.fileSize)) || Number(data.fileSize) < 0)) {
        ctx.addIssue({
          code: 'custom',
          path: ['fileSize'],
          message: 'Must be a positive number',
        });
      }
    }
  });
