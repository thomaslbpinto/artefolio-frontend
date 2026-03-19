import countries from '@/constants/countries-en.json';

type Country = { alpha2: string; name: string };

export const COUNTRIES_LIST: Country[] = countries as Country[];

export const COUNTRY_NAMES: string[] = COUNTRIES_LIST.map((country) => country.name);

export function getAlpha2ByCountryName(name: string): string | undefined {
  return COUNTRIES_LIST.find((country) => country.name === name)?.alpha2;
}
