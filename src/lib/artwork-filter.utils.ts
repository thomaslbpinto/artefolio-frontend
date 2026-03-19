import {
  ARTWORK_FILTER_COUNTRY_PARAM,
  ARTWORK_FILTER_GENRE_PARAM,
  ARTWORK_FILTER_PARAM_KEYS,
  ARTWORK_FILTER_SEARCH_PARAM,
  ARTWORK_FILTER_TECHNIQUE_PARAM,
  ARTWORK_FILTER_TYPE_LABELS,
  ARTWORK_FILTER_TYPE_PARAM,
  ARTWORK_FILTER_YEAR_MAX_PARAM,
  ARTWORK_FILTER_YEAR_MIN_PARAM,
} from '@/constants/artwork-filter.constants';
import type { ArtworkFilterChip, ArtworkFilterValues } from '@/types/artwork-filter.types';
import { EMPTY_ARTWORK_FILTER_VALUES } from '@/types/artwork-filter.types';

export function parseFilterValuesFromSearchParams(searchParams: URLSearchParams): ArtworkFilterValues {
  const search = searchParams.get(ARTWORK_FILTER_SEARCH_PARAM) ?? '';
  const type = searchParams.get(ARTWORK_FILTER_TYPE_PARAM) ?? '';
  const country = searchParams.get(ARTWORK_FILTER_COUNTRY_PARAM) ?? '';
  const techniqueRaw = searchParams.get(ARTWORK_FILTER_TECHNIQUE_PARAM) ?? '';
  const genreRaw = searchParams.get(ARTWORK_FILTER_GENRE_PARAM) ?? '';
  const technique = techniqueRaw ? techniqueRaw.split(',') : [];
  const genre = genreRaw ? genreRaw.split(',') : [];
  const yearMinRaw = searchParams.get(ARTWORK_FILTER_YEAR_MIN_PARAM);
  const yearMaxRaw = searchParams.get(ARTWORK_FILTER_YEAR_MAX_PARAM);

  const yearMin = yearMinRaw != null ? Number(yearMinRaw) : undefined;
  const yearMax = yearMaxRaw != null ? Number(yearMaxRaw) : undefined;

  return {
    search,
    type: type ? [type] : [],
    country: country ? [country] : [],
    technique,
    genre,
    yearMin: !Number.isNaN(yearMin as number) ? yearMin : undefined,
    yearMax: !Number.isNaN(yearMax as number) ? yearMax : undefined,
  };
}

export function writeFilterValuesToSearchParams(
  values: ArtworkFilterValues,
  setSearchParams: (updater: (prev: URLSearchParams) => URLSearchParams) => void,
): void {
  setSearchParams((prev) => {
    const next = new URLSearchParams(prev);

    for (const key of ARTWORK_FILTER_PARAM_KEYS) {
      next.delete(key);
    }

    const trimmedSearch = values.search.trim();
    if (trimmedSearch) {
      next.set(ARTWORK_FILTER_SEARCH_PARAM, trimmedSearch);
    }

    if (values.type[0]) {
      next.set(ARTWORK_FILTER_TYPE_PARAM, values.type[0]);
    }

    if (values.country[0]) {
      next.set(ARTWORK_FILTER_COUNTRY_PARAM, values.country[0]);
    }

    if (values.technique.length > 0) {
      next.set(ARTWORK_FILTER_TECHNIQUE_PARAM, values.technique.join(','));
    }

    if (values.genre.length > 0) {
      next.set(ARTWORK_FILTER_GENRE_PARAM, values.genre.join(','));
    }

    if (values.yearMin != null) {
      next.set(ARTWORK_FILTER_YEAR_MIN_PARAM, String(values.yearMin));
    }

    if (values.yearMax != null) {
      next.set(ARTWORK_FILTER_YEAR_MAX_PARAM, String(values.yearMax));
    }

    return next;
  });
}

export function hasActiveArtworkFilters(values: ArtworkFilterValues): boolean {
  return (
    values.search.trim() !== '' ||
    values.type.length > 0 ||
    values.technique.length > 0 ||
    values.genre.length > 0 ||
    values.country.length > 0 ||
    values.yearMin != null ||
    values.yearMax != null
  );
}

export function getYearDisplayLabel(yearMin?: number, yearMax?: number): string | null {
  if (yearMin != null && yearMax != null) {
    return yearMin === yearMax ? String(yearMin) : `${yearMin} - ${yearMax}`;
  }

  return null;
}

export function buildArtworkFilterChips(values: ArtworkFilterValues): ArtworkFilterChip[] {
  const chips: ArtworkFilterChip[] = [];

  const searchTrimmed = values.search.trim();
  if (searchTrimmed) {
    chips.push({ groupKey: 'search', id: 'search', displayLabel: searchTrimmed });
  }

  for (const type of values.type) {
    chips.push({ groupKey: 'type', id: type, displayLabel: ARTWORK_FILTER_TYPE_LABELS[type] ?? type });
  }

  for (const technique of values.technique) {
    chips.push({ groupKey: 'technique', id: technique, displayLabel: technique });
  }

  for (const genre of values.genre) {
    chips.push({ groupKey: 'genre', id: genre, displayLabel: genre });
  }

  for (const country of values.country) {
    chips.push({ groupKey: 'country', id: country, displayLabel: country });
  }

  const yearLabel = getYearDisplayLabel(values.yearMin, values.yearMax);
  if (yearLabel) {
    chips.push({ groupKey: 'year', id: 'year', displayLabel: yearLabel });
  }

  return chips;
}

export { EMPTY_ARTWORK_FILTER_VALUES };
