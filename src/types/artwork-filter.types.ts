export interface ArtworkFilterValues {
  search: string;
  technique: string[];
  genre: string[];
  type: string[];
  country: string[];
  yearMin?: number;
  yearMax?: number;
}

export interface YearFilterValue {
  yearMin?: number;
  yearMax?: number;
}

export type ArtworkFilterGroupKey = 'search' | 'type' | 'technique' | 'genre' | 'country' | 'year';

export interface ArtworkFilterChip {
  groupKey: ArtworkFilterGroupKey;
  id: string;
  displayLabel: string;
}

export const EMPTY_ARTWORK_FILTER_VALUES: ArtworkFilterValues = {
  search: '',
  technique: [],
  genre: [],
  type: [],
  country: [],
  yearMin: undefined,
  yearMax: undefined,
};
