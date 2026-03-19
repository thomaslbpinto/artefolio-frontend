import { LuX } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import type { ArtworkFilterChip, ArtworkFilterValues } from '@/types/artwork-filter.types';
import { EMPTY_ARTWORK_FILTER_VALUES } from '@/types/artwork-filter.types';
import { buildArtworkFilterChips } from '@/lib/artwork-filter.utils';

type ArtworkActiveFiltersProps = {
  values: ArtworkFilterValues;
  onValuesChange: (values: ArtworkFilterValues) => void;
  totalResults?: number | null;
};

function FilterChip({ label, onRemove, className }: { label: string; onRemove: () => void; className?: string }) {
  return (
    <span
      className={cn(
        'flex h-6 items-center gap-1 shrink-0 bg-border/50 border border-border leading-none',
        'text-foreground text-xs leading-none px-2.5 rounded-full',
        className,
      )}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
        aria-label={`Remove ${label}`}
      >
        <LuX size={12} />
      </button>
    </span>
  );
}

function getChipReactKey(chip: ArtworkFilterChip): string {
  if (chip.groupKey === 'year' || chip.groupKey === 'search') {
    return chip.groupKey;
  }

  return `${chip.groupKey}-${chip.id}`;
}

export function ArtworkActiveFilters({ values, onValuesChange, totalResults }: ArtworkActiveFiltersProps) {
  function handleRemoveChip(chip: ArtworkFilterChip) {
    if (chip.groupKey === 'year') {
      onValuesChange({ ...values, yearMin: undefined, yearMax: undefined });
      return;
    }

    if (chip.groupKey === 'search') {
      onValuesChange({ ...values, search: '' });
      return;
    }

    const key = chip.groupKey;
    onValuesChange({ ...values, [key]: (values[key] as string[]).filter((item) => item !== chip.id) });
  }

  function handleClearAll() {
    onValuesChange(EMPTY_ARTWORK_FILTER_VALUES);
  }

  const chips = buildArtworkFilterChips(values);
  const hasAny = chips.length > 0;
  const resultsLabel = totalResults != null ? `${totalResults} result${totalResults === 1 ? '' : 's'}` : null;

  return (
    <div className={cn('flex flex-col border-t border-border overflow-hidden', !hasAny && 'min-h-[calc(3rem+0.8px)]')}>
      {hasAny && (
        <div className="flex items-baseline justify-between gap-2 pt-2 px-3 sm:px-4 min-h-0">
          <span className="text-xs font-medium text-muted-foreground shrink-0">{resultsLabel ?? '\u00A0'}</span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-medium flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            aria-label="Clear all filters"
          >
            Clear all filters
          </button>
        </div>
      )}
      {hasAny && (
        <div className="flex flex-wrap items-center gap-2 p-2 px-3 sm:px-4">
          <span className="text-xs font-medium text-muted-foreground shrink-0">Filters:</span>
          {chips.map((chip) => (
            <FilterChip key={getChipReactKey(chip)} label={chip.displayLabel} onRemove={() => handleRemoveChip(chip)} />
          ))}
        </div>
      )}
    </div>
  );
}
