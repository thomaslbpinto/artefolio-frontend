import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { LuX } from 'react-icons/lu';

type ArtworkImagePreviewModalProps = {
  open: boolean;
  imageUrl: string | null;
  index: number | null;
  onClose: () => void;
};

export function ArtworkImagePreviewModal({ open, imageUrl, index, onClose }: ArtworkImagePreviewModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open || !imageUrl || index === null) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-51 bg-border/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt={`Preview ${index + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-sm"
        />
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute top-2 right-2 rounded-full p-1 bg-background/90 text-foreground border',
            'border-border cursor-pointer hover:bg-background transition-colors',
          )}
        >
          <LuX size={14} />
        </button>
      </div>
    </div>
  );
}
