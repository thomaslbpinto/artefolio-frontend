import { useState, useEffect, useCallback } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { LuSearch, LuX } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import { ArtworkChipInput } from '@/components/artwork/artwork-chip-input';
import { YearFilterSlider } from '@/components/artwork/filter/year-filter-slider';
import { cn } from '@/lib/utils';
import { ARTWORK_GENRES, ARTWORK_TECHNIQUES } from '@/types/artwork.types';
import { COUNTRY_NAMES, getAlpha2ByCountryName } from '@/lib/country.utils';
import {
  ARTWORK_FILTER_INPUT_CLASS,
  ARTWORK_FILTER_MAX_GENRES,
  ARTWORK_FILTER_MAX_TECHNIQUES,
  ARTWORK_FILTER_TYPE_OPTIONS,
} from '@/constants/artwork-filter.constants';
import type { ArtworkFilterValues } from '@/types/artwork-filter.types';

type ArtworkFilterControlsProps = {
  values: ArtworkFilterValues;
  onValuesChange: (values: ArtworkFilterValues) => void;
};

export function ArtworkFilterControls({ values, onValuesChange }: ArtworkFilterControlsProps) {
  const [techniqueInput, setTechniqueInput] = useState('');
  const [genreInput, setGenreInput] = useState('');
  const [typeInput, setTypeInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [searchInput, setSearchInput] = useState(values.search);

  const update = useCallback(
    (patch: Partial<ArtworkFilterValues>) => {
      onValuesChange({ ...values, ...patch });
    },
    [values, onValuesChange],
  );

  useEffect(() => {
    const id = setTimeout(() => setSearchInput(values.search), 0);
    return () => clearTimeout(id);
  }, [values.search]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    update({ search: '' });
  }, [update]);

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        const trimmed = searchInput.trim();
        update({ search: trimmed });
      }
    },
    [searchInput, update],
  );

  const showClearSearch = values.search.length > 0;

  return (
    <div className="flex flex-col gap-2 border-t border-border py-2 sm:py-3 px-3 sm:px-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2">
      <div className="flex w-full items-center gap-2 lg:contents">
        <div className="relative min-w-0 flex-1 lg:flex-initial lg:w-auto">
          <LuSearch
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground sm:left-2.5"
            aria-hidden
          />
          <Input
            placeholder="Search..."
            aria-label="Search artworks"
            value={searchInput}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            className={cn(ARTWORK_FILTER_INPUT_CLASS, 'w-full lg:w-70 pl-8 pr-8')}
          />
          {showClearSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground hover:text-foreground rounded p-0.5"
              aria-label="Clear search"
            >
              <LuX size={14} />
            </button>
          )}
        </div>
        <div className="w-30 min-w-0 shrink-0">
          <ArtworkChipInput
            value={values.type}
            inputValue={typeInput}
            onInputChange={setTypeInput}
            onChange={(type) => update({ type })}
            maxItems={1}
            options={ARTWORK_FILTER_TYPE_OPTIONS}
            placeholder="Type"
            summaryOnly
            triggerClassName={ARTWORK_FILTER_INPUT_CLASS}
          />
        </div>
        <div className="w-45 min-w-0 shrink-0">
          <ArtworkChipInput
            value={values.technique}
            inputValue={techniqueInput}
            onInputChange={setTechniqueInput}
            onChange={(technique) => update({ technique })}
            maxItems={ARTWORK_FILTER_MAX_TECHNIQUES}
            options={ARTWORK_TECHNIQUES}
            placeholder="Technique"
            summaryOnly
            triggerClassName={ARTWORK_FILTER_INPUT_CLASS}
            searchable
          />
        </div>
      </div>

      <div className="flex w-full items-center gap-2 lg:contents">
        <div className="min-w-0 flex-[1_1_11.25rem] lg:flex-initial lg:w-45">
          <ArtworkChipInput
            value={values.genre}
            inputValue={genreInput}
            onInputChange={setGenreInput}
            onChange={(genre) => update({ genre })}
            maxItems={ARTWORK_FILTER_MAX_GENRES}
            options={ARTWORK_GENRES}
            placeholder="Genre"
            summaryOnly
            triggerClassName={ARTWORK_FILTER_INPUT_CLASS}
            searchable
          />
        </div>
        <div className="min-w-0 flex-[1_1_12.5rem] lg:flex-initial lg:w-50">
          <ArtworkChipInput
            value={values.country}
            inputValue={countryInput}
            onInputChange={setCountryInput}
            onChange={(country) => update({ country })}
            maxItems={1}
            options={COUNTRY_NAMES}
            placeholder="Country"
            summaryOnly
            triggerClassName={ARTWORK_FILTER_INPUT_CLASS}
            searchable
            renderItemLeading={(name) => {
              const alpha2 = getAlpha2ByCountryName(name);
              return alpha2 ? (
                <ReactCountryFlag countryCode={alpha2} title={name} svg style={{ width: '1.4em', height: '1.4em' }} />
              ) : null;
            }}
            renderItemLeadingInListOnly
          />
        </div>
        <div className="min-w-0 flex-[1_1_5rem] lg:flex-initial lg:w-35">
          <YearFilterSlider
            value={{ yearMin: values.yearMin, yearMax: values.yearMax }}
            onChange={({ yearMin, yearMax }) => update({ yearMin, yearMax })}
            triggerClassName={ARTWORK_FILTER_INPUT_CLASS}
          />
        </div>
      </div>
    </div>
  );
}
