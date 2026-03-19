import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ARTWORK_TOTAL_CHANGED_EVENT } from '@/constants/artwork-filter.constants';
import type { ArtworkFilterValues } from '@/types/artwork-filter.types';
import {
  parseFilterValuesFromSearchParams,
  writeFilterValuesToSearchParams,
  hasActiveArtworkFilters,
} from '@/lib/artwork-filter.utils';
import { ArtworkFilterControls } from './artwork-filter-controls';
import { ArtworkActiveFilters } from './artwork-active-filters';

type ArtworkFilterBarProps = {
  open: boolean;
};

export function ArtworkFilterBar({ open }: ArtworkFilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterValues, setFilterValues] = useState<ArtworkFilterValues>(() =>
    parseFilterValuesFromSearchParams(searchParams),
  );
  const [totalResults, setTotalResults] = useState<number | null>(null);

  useEffect(() => {
    writeFilterValuesToSearchParams(filterValues, setSearchParams);
  }, [filterValues, setSearchParams]);

  useEffect(() => {
    function handleTotalChanged(event: Event) {
      const custom = event as CustomEvent<{ total: number }>;
      setTotalResults(custom.detail.total);
    }

    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener(ARTWORK_TOTAL_CHANGED_EVENT, handleTotalChanged as EventListener);
    return () => {
      window.removeEventListener(ARTWORK_TOTAL_CHANGED_EVENT, handleTotalChanged as EventListener);
    };
  }, []);

  const handleValuesChange = useCallback((values: ArtworkFilterValues) => {
    setFilterValues(values);
  }, []);

  const hasFilters = hasActiveArtworkFilters(filterValues);
  const displayedTotalResults = useMemo(() => (hasFilters ? totalResults : 0), [hasFilters, totalResults]);

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'transition-all duration-500',
          open ? 'max-h-50 opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden',
        )}
      >
        <ArtworkFilterControls values={filterValues} onValuesChange={handleValuesChange} />
      </div>

      <div
        className={cn(
          'transition-all duration-500 overflow-hidden',
          hasFilters ? 'max-h-28 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <ArtworkActiveFilters
          values={filterValues}
          onValuesChange={handleValuesChange}
          totalResults={displayedTotalResults}
        />
      </div>
    </div>
  );
}
