import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Artwork, ArtworkImage } from '@/types/artwork.types';

const COVER_IMAGE_ORDER = 1;
const PAGE_SIZE = 18;

export interface ArtworkCardFramesData {
  id: number;
  title: string;
  imageUrl: string;
  width: number;
  height: number;
}

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

export function useInfiniteArtworks() {
  const [artworks, setArtworks] = useState<ArtworkCardFramesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(async (pageNum: number, append: boolean) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const { artworks, pagination } = await apiClient.fetchArtworksPage(pageNum, PAGE_SIZE);
      const nextArtworks = artworks
        .map(toArtworkCardData)
        .filter((item): item is ArtworkCardFramesData => item !== null);

      setArtworks((prev) => (append ? [...prev, ...nextArtworks] : nextArtworks));
      setHasMore(artworks.length === pagination.limit);
      setPage(pageNum);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

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
