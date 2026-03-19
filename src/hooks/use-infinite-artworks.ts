import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import type { Artwork, ArtworkImage, ArtworkFilters, ArtworkCardFramesData } from '@/types/artwork.types';
import {
  ARTWORK_FILTER_COUNTRY_PARAM,
  ARTWORK_FILTER_GENRE_PARAM,
  ARTWORK_FILTER_SEARCH_PARAM,
  ARTWORK_FILTER_TECHNIQUE_PARAM,
  ARTWORK_FILTER_TYPE_PARAM,
  ARTWORK_FILTER_YEAR_MAX_PARAM,
  ARTWORK_FILTER_YEAR_MIN_PARAM,
  ARTWORK_TOTAL_CHANGED_EVENT,
} from '@/constants/artwork-filter.constants';

const COVER_IMAGE_ORDER = 1;
const PAGE_SIZE = 18;

function getCoverImage(images: ArtworkImage[]): ArtworkImage | undefined {
  return images.find((image) => image.order === COVER_IMAGE_ORDER);
}

function toArtworkCardData(artwork: Artwork): ArtworkCardFramesData | null {
  const cover = getCoverImage(artwork.images);

  if (!cover?.url) {
    return null;
  }

  return {
    id: artwork.id,
    title: artwork.title,
    imageUrl: cover.url,
    width: cover.width,
    height: cover.height,
  };
}

function buildApiFiltersFromSearchParams(
  searchParams: URLSearchParams,
): Partial<Omit<ArtworkFilters, 'page' | 'limit'>> {
  const search = searchParams.get(ARTWORK_FILTER_SEARCH_PARAM) ?? '';
  const type = searchParams.get(ARTWORK_FILTER_TYPE_PARAM) ?? undefined;
  const country = searchParams.get(ARTWORK_FILTER_COUNTRY_PARAM) ?? undefined;
  const techniqueRaw = searchParams.get(ARTWORK_FILTER_TECHNIQUE_PARAM) ?? '';
  const genreRaw = searchParams.get(ARTWORK_FILTER_GENRE_PARAM) ?? '';
  const technique = techniqueRaw ? techniqueRaw.split(',') : [];
  const genre = genreRaw ? genreRaw.split(',') : [];
  const yearMinRaw = searchParams.get(ARTWORK_FILTER_YEAR_MIN_PARAM);
  const yearMaxRaw = searchParams.get(ARTWORK_FILTER_YEAR_MAX_PARAM);
  const yearMin = yearMinRaw != null ? Number(yearMinRaw) : undefined;
  const yearMax = yearMaxRaw != null ? Number(yearMaxRaw) : undefined;

  const filters: Partial<Omit<ArtworkFilters, 'page' | 'limit'>> = {};

  if (search.trim()) {
    filters.search = search.trim();
  }
  if (type) {
    filters.type = type as ArtworkFilters['type'];
  }
  if (country) {
    filters.country = country;
  }
  if (technique.length > 0) {
    filters.technique = technique as ArtworkFilters['technique'];
  }
  if (genre.length > 0) {
    filters.genre = genre as ArtworkFilters['genre'];
  }
  if (!Number.isNaN(yearMin as number)) {
    filters.yearMin = yearMin;
  }
  if (!Number.isNaN(yearMax as number)) {
    filters.yearMax = yearMax;
  }

  return filters;
}

export function useInfiniteArtworks() {
  const [searchParams] = useSearchParams();

  const [artworks, setArtworks] = useState<ArtworkCardFramesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const filters = buildApiFiltersFromSearchParams(searchParams);
        const { artworks: raw, pagination } = await apiClient.fetchArtworksPage(pageNum, PAGE_SIZE, filters);
        const nextArtworks = raw.map(toArtworkCardData).filter((item): item is ArtworkCardFramesData => item !== null);

        setArtworks((prev) => (append ? [...prev, ...nextArtworks] : nextArtworks));
        setHasMore(raw.length === pagination.limit);
        setPage(pageNum);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent(ARTWORK_TOTAL_CHANGED_EVENT, {
              detail: { total: pagination.total },
            }),
          );
        }
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchParams],
  );

  useEffect(() => {
    loadPage(1, false);
  }, [loadPage]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) {
      return;
    }

    const element = sentinelRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadPage(page + 1, true);
        }
      },
      { rootMargin: '500px', threshold: 0 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, loadPage]);

  return { artworks, loading, loadingMore, hasMore, sentinelRef };
}
