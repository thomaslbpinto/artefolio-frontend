import { LuGlobe, LuLock } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Visibility } from '@/types/artwork.types';

type CreateArtworkPageHeaderProps = {
  title: string;
  visibility: Visibility;
  onToggleVisibility: () => void;
  loading: boolean;
  formId: string;
};

export function CreateArtworkPageHeader({
  title,
  visibility,
  onToggleVisibility,
  loading,
  formId,
}: CreateArtworkPageHeaderProps) {
  const isPublicVisibility = visibility === Visibility.PUBLIC;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <h1 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onToggleVisibility}
          className={cn(
            'rounded-full',
            isPublicVisibility ? 'text-foreground' : 'bg-foreground text-background hover:bg-foreground/90',
          )}
        >
          {isPublicVisibility ? (
            <>
              <LuGlobe size={16} /> Public
            </>
          ) : (
            <>
              <LuLock size={16} /> Private
            </>
          )}
        </Button>

        <Button type="submit" form={formId} disabled={loading}>
          {loading ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}
