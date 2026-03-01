import { useEffect, useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuMonitor, LuPencil } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ErrorBanner } from '@/components/ui/error-banner';
import { FieldError } from '@/components/ui/field-error';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { preventFormSubmitOnEnter } from '@/lib/form';
import { cn } from '@/lib/utils';
import { ArtworkType, Visibility, type Artwork } from '@/types/artwork.types';
import type { Collection } from '@/types/collection.types';
import { useCreateArtworkForm, type UploadedImage } from '@/hooks/use-create-artwork-form';
import { ArtworkImageUploader } from '@/components/artwork/artwork-image-uploader';
import { ArtworkImagePreviewModal } from '@/components/artwork/artwork-image-preview-modal';
import { ArtworkTagsInput } from '@/components/artwork/artwork-tags-input';
import { ArtworkCollectionSelect } from '@/components/artwork/artwork-collection-select';
import { ArtworkPageHeader } from '@/components/artwork/artwork-page-header';
import { ArtworkTechnicalDetails } from '@/components/artwork/artwork-technical-details';

const MAX_IMAGES = 8;
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function CreateArtworkPage() {
  const [createdArtwork, setCreatedArtwork] = useState<Artwork | null>(null);
  const {
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
    MAX_ARTWORK_GENRES,
    MAX_ARTWORK_TECHNIQUES,
    MAX_TITLE_LENGTH,
  } = useCreateArtworkForm({
    onSuccess: (artwork) => {
      setCreatedArtwork(artwork);
    },
  });
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [technicalDetailsOpen, setTechnicalDetailsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .fetchUserCollections()
      .then(setCollections)
      .catch(() => {});
  }, []);

  function handleArtworkTypeChange(type: ArtworkType) {
    handleTypeChange(type);
  }

  function toggleVisibility() {
    setFormData((prev) => ({
      ...prev,
      visibility: prev.visibility === Visibility.PUBLIC ? Visibility.PRIVATE : Visibility.PUBLIC,
    }));
  }

  async function handleCreateArtwork(event: SubmitEvent<HTMLFormElement>) {
    const fieldErrors = await handleSubmit(event, uploadedImages, tags);

    if (!fieldErrors) {
      return;
    }

    const technicalDetailKeys = [
      'year',
      'technique',
      'genre',
      'physicalHeight',
      'physicalWidth',
      'physicalDepth',
      'digitalHeight',
      'digitalWidth',
      'fileSize',
    ];

    const hasTechnicalDetailError = technicalDetailKeys.some((key) => fieldErrors[key as keyof typeof fieldErrors]);

    if (hasTechnicalDetailError) {
      setTechnicalDetailsOpen(true);
    }

    setTimeout(() => {
      const isDesktop = window.innerWidth >= 1024;

      if (fieldErrors.images || (isDesktop && fieldErrors.title)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      for (const error of Object.keys(fieldErrors)) {
        document.getElementById(error)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
        break;
      }
    }, 50);
  }

  function handleGenreChange(genre: string[]) {
    setErrors((prev) => ({
      ...prev,
      genre: undefined,
      submit: undefined,
    }));
    setFormData((prev) => ({ ...prev, genre }));
  }

  function handleTechniqueChange(technique: string[]) {
    setErrors((prev) => ({
      ...prev,
      technique: undefined,
      submit: undefined,
    }));
    setFormData((prev) => ({ ...prev, technique }));
  }

  function handleCountryChange(country: string) {
    setErrors((prev) => ({
      ...prev,
      submit: undefined,
    }));
    setFormData((prev) => ({ ...prev, country }));
  }

  // TODO: Reset the form and show a toast saying that the artwork was created successfully

  if (createdArtwork) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="text-center space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">Artwork created!</h2>
          <p className="text-sm text-muted-foreground">{createdArtwork.title}</p>
          <div className="flex gap-3 justify-center pt-2">
            <Button type="button" onClick={() => navigate('/')}>
              Back to home
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreatedArtwork(null);
                reset();
                setUploadedImages([]);
                setTags([]);
                setTagInput('');
                setErrors({});
              }}
            >
              Create another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <ArtworkPageHeader
        title="New Artwork"
        visibility={formData.visibility}
        onToggleVisibility={toggleVisibility}
        loading={loading}
        formId="create-artwork-form"
      />

      <div className="p-6 sm:p-8">
        <ErrorBanner message={errors.submit} />

        <form id="create-artwork-form" onSubmit={handleCreateArtwork} onKeyDown={preventFormSubmitOnEnter} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-10">
            <div className="lg:col-span-5 space-y-4">
              <ArtworkImageUploader
                images={uploadedImages}
                onChange={(next) => {
                  setErrors((prev) => ({ ...prev, images: undefined, submit: undefined }));
                  setUploadedImages(next);
                }}
                onErrorChange={(message) =>
                  setErrors((prev) => ({
                    ...prev,
                    images: message,
                  }))
                }
                error={errors.images}
                disabled={loading}
                maxImages={MAX_IMAGES}
                maxFileSizeMb={MAX_FILE_SIZE_MB}
                acceptedTypes={ACCEPTED_IMAGE_TYPES}
                onPreview={(index) => setPreviewImageIndex(index)}
              />
            </div>

            <div className="space-y-3 sm:space-y-3.5 lg:col-span-7 mt-2 lg:mt-0">
              <div className="relative flex bg-border/50 p-1 rounded-sm w-full border border-border">
                <div
                  className={cn(
                    'absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-sm shadow-md transition-all duration-300 ease-out',
                    formData.type === ArtworkType.DIGITAL ? 'left-1' : 'left-[50%]',
                  )}
                />
                <button
                  type="button"
                  onClick={() => handleArtworkTypeChange(ArtworkType.DIGITAL)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-sm relative transition-colors duration-200 cursor-pointer',
                    formData.type === ArtworkType.DIGITAL
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <LuMonitor className="text-base" />
                  Digital
                </button>
                <button
                  type="button"
                  onClick={() => handleArtworkTypeChange(ArtworkType.PHYSICAL)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-sm relative transition-colors duration-200 cursor-pointer',
                    formData.type === ArtworkType.PHYSICAL
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <LuPencil className="text-base" />
                  Physical
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" required>
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleFieldChange}
                  placeholder="Give your artwork a title"
                  maxLength={MAX_TITLE_LENGTH}
                  disabled={loading}
                />
                <FieldError message={errors.title} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  rows={2}
                  onChange={handleFieldChange}
                  placeholder="Describe this piece in detail..."
                  disabled={loading}
                />
              </div>

              <ArtworkCollectionSelect
                collections={collections}
                value={formData.collectionId}
                onChange={(collectionId) => setFormData((prev) => ({ ...prev, collectionId }))}
                onCreateNew={() => navigate('/collection/create')}
                disabled={loading}
              />

              <ArtworkTagsInput
                value={tags}
                inputValue={tagInput}
                onInputChange={setTagInput}
                onChange={setTags}
                maxTags={MAX_TAGS}
                maxTagLength={MAX_TAG_LENGTH}
                error={errors.tags}
                disabled={loading}
                onErrorChange={(message) =>
                  setErrors((prev) => ({
                    ...prev,
                    tags: message,
                  }))
                }
              />

              <ArtworkTechnicalDetails
                formData={formData}
                errors={errors}
                onChange={handleFieldChange}
                onCountryChange={handleCountryChange}
                onGenreChange={handleGenreChange}
                onTechniqueChange={handleTechniqueChange}
                onYearBlur={handleYearBlur}
                onYearChange={() => setErrors((prev) => ({ ...prev, year: undefined }))}
                open={technicalDetailsOpen}
                onToggle={() => setTechnicalDetailsOpen((prev) => !prev)}
                disabled={loading}
                currentYear={CURRENT_YEAR}
                maxArtworkGenres={MAX_ARTWORK_GENRES}
                maxArtworkTechniques={MAX_ARTWORK_TECHNIQUES}
              />
            </div>
          </div>
        </form>
      </div>

      <ArtworkImagePreviewModal
        open={previewImageIndex !== null && !!uploadedImages[previewImageIndex]}
        imageUrl={
          previewImageIndex !== null && uploadedImages[previewImageIndex]
            ? uploadedImages[previewImageIndex].previewUrl
            : null
        }
        index={previewImageIndex}
        onClose={() => setPreviewImageIndex(null)}
      />
    </div>
  );
}
