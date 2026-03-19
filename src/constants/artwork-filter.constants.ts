import { ArtworkType } from '@/types/artwork.types';

export const ARTWORK_FILTER_SEARCH_PARAM = 'search';
export const ARTWORK_FILTER_TYPE_PARAM = 'type';
export const ARTWORK_FILTER_TECHNIQUE_PARAM = 'technique';
export const ARTWORK_FILTER_GENRE_PARAM = 'genre';
export const ARTWORK_FILTER_COUNTRY_PARAM = 'country';
export const ARTWORK_FILTER_YEAR_MIN_PARAM = 'yearMin';
export const ARTWORK_FILTER_YEAR_MAX_PARAM = 'yearMax';

export const ARTWORK_FILTER_PARAM_KEYS = [
  ARTWORK_FILTER_SEARCH_PARAM,
  ARTWORK_FILTER_TYPE_PARAM,
  ARTWORK_FILTER_TECHNIQUE_PARAM,
  ARTWORK_FILTER_GENRE_PARAM,
  ARTWORK_FILTER_COUNTRY_PARAM,
  ARTWORK_FILTER_YEAR_MIN_PARAM,
  ARTWORK_FILTER_YEAR_MAX_PARAM,
] as const;

export const ARTWORK_FILTER_MAX_TECHNIQUES = 5;
export const ARTWORK_FILTER_MAX_GENRES = 5;

export const ARTWORK_FILTER_YEAR_MIN = 1950;
export const ARTWORK_FILTER_YEAR_MAX = 2025;

export const ARTWORK_FILTER_TYPE_OPTIONS = [ArtworkType.DIGITAL, ArtworkType.PHYSICAL] as const;

export const ARTWORK_FILTER_TYPE_LABELS: Record<string, string> = {
  [ArtworkType.DIGITAL]: 'Digital',
  [ArtworkType.PHYSICAL]: 'Physical',
};

export const ARTWORK_TOTAL_CHANGED_EVENT = 'artwork:total-changed';

export const ARTWORK_FILTER_INPUT_CLASS =
  'bg-muted-foreground/5 py-2 px-3 text-sm rounded-md border border-border transition-colors';
