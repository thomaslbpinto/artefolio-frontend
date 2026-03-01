import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { LuCloudUpload, LuInfo, LuPlus } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { FieldError } from '@/components/ui/field-error';
import type { UploadedImage } from '@/hooks/use-create-artwork-form';
import { SortableImageCard } from '@/components/sortable-image-card';

type ArtworkImageUploaderProps = {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  onErrorChange?: (message?: string) => void;
  error?: string;
  disabled?: boolean;
  maxImages: number;
  maxFileSizeMb: number;
  acceptedTypes: string[];
  onPreview: (index: number) => void;
};

export function ArtworkImageUploader({
  images,
  onChange,
  onErrorChange,
  error,
  disabled,
  maxImages,
  maxFileSizeMb,
  acceptedTypes,
  onPreview,
}: ArtworkImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragDepthRef = useRef(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

  function openFilePicker() {
    if (disabled) {
      return;
    }

    fileInputRef.current?.click();
  }

  function processUploadedFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    const remainingSlots = maxImages - images.length;

    if (remainingSlots <= 0) {
      onChange([...images]);
      onErrorChange?.(`Maximum of ${maxImages} images allowed`);
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const rejectionMessages: string[] = [];
    const validImages: UploadedImage[] = [];

    for (const file of filesToProcess) {
      if (!acceptedTypes.includes(file.type)) {
        rejectionMessages.push(`"${file.name}" has an unsupported file type`);
        continue;
      }

      if (file.size > maxFileSizeBytes) {
        rejectionMessages.push(`"${file.name}" exceeds ${maxFileSizeMb}MB file size limit`);
        continue;
      }

      validImages.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (files.length > remainingSlots) {
      rejectionMessages.push(`Only ${remainingSlots} image(s) was added. Maximum of ${maxImages} images allowed`);
    }

    const nextImages = [...images, ...validImages];

    onChange(nextImages);
    onErrorChange?.(rejectionMessages.length > 0 ? rejectionMessages.join(' ') : undefined);
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    processUploadedFiles(files);
    event.target.value = '';
  }

  function handleUploadDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDraggingOver(false);

    if (disabled) {
      return;
    }

    const files = Array.from(event.dataTransfer?.files || []);
    processUploadedFiles(files);
  }

  function removeUploadedImage(imageId: string) {
    const nextImages = images.filter((image) => {
      if (image.id === imageId) {
        URL.revokeObjectURL(image.previewUrl);
        return false;
      }
      return true;
    });
    onChange(nextImages);
  }

  function handleImageDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    onChange(
      arrayMove(
        images,
        images.findIndex((image) => image.id === active.id),
        images.findIndex((image) => image.id === over.id),
      ),
    );
  }

  const hasImages = images.length > 0;

  return (
    <div id="artwork-images-upload" className="space-y-3 sm:space-y-3.5">
      <div className="space-y-1.5">
        <div>
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label="Upload images. Click or press Enter to select files."
            className={cn(
              'relative flex flex-col items-center justify-center rounded-sm border-2',
              'border-dashed cursor-pointer overflow-hidden min-h-[200px] p-8',
              'transition-all duration-200 ease-out',
              error
                ? 'bg-error/5 border-error'
                : isDraggingOver
                  ? 'border-border bg-border/50'
                  : 'border-border bg-background hover:bg-border/50',
            )}
            onClick={openFilePicker}
            onKeyDown={(event) => {
              if (disabled) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openFilePicker();
              }
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              if (disabled) {
                return;
              }

              dragDepthRef.current += 1;
              setIsDraggingOver(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!disabled) {
                setIsDraggingOver(true);
              }
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              if (disabled) {
                return;
              }

              dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
              if (dragDepthRef.current === 0) {
                setIsDraggingOver(false);
              }
            }}
            onDrop={handleUploadDrop}
          >
            <div className="mb-4">
              <LuCloudUpload size={28} />
            </div>
            <p className="text-sm font-medium text-foreground text-center">
              Click to upload or drag and drop files here
            </p>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              Supported formats: PNG, JPG, or WebP
              <br />
              Maximum file size: {maxFileSizeMb}MB per file
            </p>

            <div
              className={cn(
                'absolute bottom-3 right-3 px-2 py-0.5 bg-background rounded-full',
                'text-xs font-medium text-muted-foreground border border-border',
              )}
            >
              {images.length} / {maxImages}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(',')}
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={disabled}
            />
          </div>
        </div>
        <FieldError message={error} />
      </div>

      {hasImages && (
        <>
          {images.length > 1 && (
            <div
              className={cn(
                'flex items-center gap-2 text-xs text-muted-foreground',
                'bg-border/50 rounded-sm p-3 border border-border',
              )}
            >
              <LuInfo size={14} />
              <span>
                The first image will be the artwork&apos;s cover image. You can drag and drop to change the order.
              </span>
            </div>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleImageDragEnd}>
            <SortableContext items={images.map((image) => image.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                {images.map((image, index) => (
                  <SortableImageCard
                    key={image.id}
                    id={image.id}
                    src={image.previewUrl}
                    index={index}
                    isCover={index === 0}
                    onPreview={() => onPreview(index)}
                    onRemove={() => removeUploadedImage(image.id)}
                  />
                ))}

                {images.length < maxImages && (
                  <div
                    className={cn(
                      'aspect-square rounded-sm border-2 border-dashed border-border',
                      'bg-background flex items-center justify-center cursor-pointer',
                      'hover:bg-border/50 transition-all duration-200 ease-out',
                    )}
                    onClick={openFilePicker}
                  >
                    <LuPlus size={20} className="text-muted-foreground" />
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}
