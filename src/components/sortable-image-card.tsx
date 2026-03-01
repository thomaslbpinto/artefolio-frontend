import type { CSSProperties } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { LuX } from 'react-icons/lu';

interface SortableImageCardProps {
  id: string;
  src: string;
  index: number;
  isCover: boolean;
  onPreview: () => void;
  onRemove: () => void;
}

export function SortableImageCard({ id, src, index, isCover, onPreview, onRemove }: SortableImageCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group/card aspect-square rounded-sm overflow-hidden cursor-pointer border-2',
        'before:absolute before:inset-0 before:bg-black/0 before:transition-colors before:duration-200 before:ease-out hover:before:bg-black/15',
        isCover ? 'border-primary' : 'border-border',
      )}
      onClick={onPreview}
      {...attributes}
      {...listeners}
    >
      <img src={src} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
      {isCover && (
        <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-xs text-center py-1">
          Cover Image
        </span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 rounded-full p-1 bg-background/90 text-foreground shadow-sm border border-border cursor-pointer hover:bg-background transition-colors"
      >
        <LuX className="text-xs" />
      </button>
    </div>
  );
}
