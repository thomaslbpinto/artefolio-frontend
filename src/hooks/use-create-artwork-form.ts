import { useState, type SubmitEvent } from 'react';
import { apiClient } from '@/lib/api-client';
import { createInputChangeHandler } from '@/lib/form';
import {
  artworkFormSchema,
  CURRENT_YEAR,
  MAX_TAG_LENGTH,
  MAX_TAGS,
  MAX_TITLE_LENGTH,
  MAX_ARTWORK_GENRES,
  MAX_ARTWORK_TECHNIQUES,
} from '@/lib/validation';
import { ArtworkType, Visibility, type Artwork } from '@/types/artwork.types';

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
}

export interface ArtworkFormData {
  type: ArtworkType;
  title: string;
  description: string;
  year: string;
  country: string;
  technique: string[];
  genre: string[];
  physicalHeight: string;
  physicalWidth: string;
  physicalDepth: string;
  digitalHeight: string;
  digitalWidth: string;
  fileSize: string;
  materials: string;
  tools: string;
  visibility: Visibility;
  collectionId: string;
}

export interface ArtworkFormErrors {
  images?: string;
  title?: string;
  year?: string;
  technique?: string;
  genre?: string;
  physicalHeight?: string;
  physicalWidth?: string;
  physicalDepth?: string;
  digitalHeight?: string;
  digitalWidth?: string;
  fileSize?: string;
  tags?: string;
  submit?: string;
}

export const INITIAL_ARTWORK_FORM: ArtworkFormData = {
  type: ArtworkType.DIGITAL,
  title: '',
  description: '',
  year: '',
  country: '',
  technique: [],
  genre: [],
  physicalHeight: '',
  physicalWidth: '',
  physicalDepth: '',
  digitalHeight: '',
  digitalWidth: '',
  fileSize: '',
  materials: '',
  tools: '',
  visibility: Visibility.PUBLIC,
  collectionId: '',
};

export function buildArtworkPayload(formData: ArtworkFormData, images: UploadedImage[], tags: string[]): FormData {
  const payload = new FormData();

  images.forEach((image) => payload.append('images', image.file));

  payload.append('type', formData.type);
  payload.append('title', formData.title.trim());
  payload.append('visibility', formData.visibility);

  if (formData.description.trim()) payload.append('description', formData.description.trim());
  if (formData.year) payload.append('year', formData.year);
  if (formData.country.trim()) payload.append('country', formData.country.trim());
  formData.genre.forEach((genre) => payload.append('genre', genre));
  formData.technique.forEach((technique) => payload.append('technique', technique));
  if (formData.collectionId) payload.append('collectionId', formData.collectionId);

  if (formData.type === ArtworkType.PHYSICAL) {
    if (formData.materials.trim()) payload.append('materials', formData.materials.trim());
    if (formData.physicalHeight) payload.append('physicalHeight', formData.physicalHeight);
    if (formData.physicalWidth) payload.append('physicalWidth', formData.physicalWidth);
    if (formData.physicalDepth) payload.append('physicalDepth', formData.physicalDepth);
  }

  if (formData.type === ArtworkType.DIGITAL) {
    if (formData.tools.trim()) payload.append('tools', formData.tools.trim());
    if (formData.digitalWidth) payload.append('digitalWidth', formData.digitalWidth);
    if (formData.digitalHeight) payload.append('digitalHeight', formData.digitalHeight);
    if (formData.fileSize) {
      const fileSizeBytes = Math.round(parseFloat(formData.fileSize) * 1024 * 1024);
      payload.append('fileSize', String(fileSizeBytes));
    }
  }

  tags.forEach((tag) => payload.append('tags', tag));

  return payload;
}

type UseCreateArtworkFormConfig = {
  onSuccess?: (artwork: Artwork) => void;
};

export function useCreateArtworkForm(config: UseCreateArtworkFormConfig = {}) {
  const [formData, setFormData] = useState<ArtworkFormData>(INITIAL_ARTWORK_FORM);
  const [errors, setErrors] = useState<ArtworkFormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleFieldChange = createInputChangeHandler<ArtworkFormData, ArtworkFormErrors>(setFormData, setErrors, {
    fieldErrorValue: undefined,
    clearErrorKeys: ['submit'],
  });

  function handleTypeChange(type: ArtworkType) {
    setFormData((prev) => ({ ...prev, type }));
    setErrors((prev) => ({
      ...prev,
      technique: undefined,
      genre: undefined,
      physicalHeight: undefined,
      physicalWidth: undefined,
      physicalDepth: undefined,
      digitalHeight: undefined,
      digitalWidth: undefined,
      fileSize: undefined,
      submit: undefined,
    }));
  }

  function validateYear(value: string): string | undefined {
    if (!value.trim()) return undefined;
    const yearNum = Number(value);
    if (!Number.isInteger(yearNum) || yearNum < 1 || yearNum > CURRENT_YEAR) {
      return `Year must be between 1 and ${CURRENT_YEAR}`;
    }
    return undefined;
  }

  function handleYearBlur() {
    setErrors((prev) => ({
      ...prev,
      year: validateYear(formData.year),
    }));
  }

  async function handleSubmit(
    event: SubmitEvent<HTMLFormElement>,
    uploadedImages: UploadedImage[],
    tags: string[],
  ): Promise<ArtworkFormErrors | void> {
    event.preventDefault();

    const result = artworkFormSchema.safeParse(formData);

    const fieldErrors: ArtworkFormErrors = {};

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof ArtworkFormErrors] = issue.message;
        }
      });
    }

    if (uploadedImages.length === 0) {
      fieldErrors.images = 'At least one image is required';
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return fieldErrors;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload = buildArtworkPayload(formData, uploadedImages, tags);
      const artwork = await apiClient.createArtwork(payload);
      config.onSuccess?.(artwork);
    } catch (error: unknown) {
      const message = error.response?.data?.message || 'Failed to create artwork. Please try again.';
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFormData(INITIAL_ARTWORK_FORM);
    setErrors({});
  }

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    loading,
    handleFieldChange,
    handleTypeChange,
    handleYearBlur,
    handleSubmit,
    reset,
    CURRENT_YEAR,
    MAX_TAG_LENGTH,
    MAX_TAGS,
    MAX_TITLE_LENGTH,
    MAX_ARTWORK_GENRES,
    MAX_ARTWORK_TECHNIQUES,
  };
}
