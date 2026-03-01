import { LuFolderPlus, LuImage } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import type { Collection } from '@/types/collection.types';
import { Label } from '@/components/ui/label';
import { Select, type SelectOption } from '@/components/ui/select';

type ArtworkCollectionSelectProps = {
  collections: Collection[];
  value: string;
  onChange: (collectionId: string) => void;
  onCreateNew: () => void;
  disabled?: boolean;
};

export function ArtworkCollectionSelect({
  collections,
  value,
  onChange,
  onCreateNew,
  disabled,
}: ArtworkCollectionSelectProps) {
  const options: SelectOption[] = collections.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <div className="space-y-1.5">
      <Label>Collection</Label>
      <Select
        id="collection"
        name="collection"
        value={value}
        onValueChange={onChange}
        options={options}
        placeholder="Select a collection"
        disabled={disabled}
        searchable={true}
        searchPlaceholder="Search collection..."
        emptyMessage="No collections found"
        renderOption={(option) => {
          const collection = collections.find((c) => String(c.id) === option.value);
          const previewUrl = collection?.artworks?.[0]?.images?.[0]?.url;
          return (
            <>
              <div
                className={cn(
                  'w-8 h-8 rounded-sm bg-foreground/10 overflow-hidden shrink-0 flex items-center justify-center',
                )}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={`Preview image for collection ${option.label}`}
                    className="w-full h-full object-cover border border-border rounded-sm"
                  />
                ) : (
                  <LuImage size={16} className="text-muted-foreground" />
                )}
              </div>
              <span className="truncate">{option.label}</span>
            </>
          );
        }}
        renderFooter={(onClose) => (
          <button
            type="button"
            onClick={() => {
              onClose();
              onCreateNew();
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 text-sm',
              'text-foreground hover:bg-border/50 transition-colors duration-200 ease-out cursor-pointer',
            )}
          >
            <LuFolderPlus size={16} className="text-foreground" />
            Create new collection
          </button>
        )}
      />
    </div>
  );
}
