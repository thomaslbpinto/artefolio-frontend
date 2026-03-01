import { RegularMasonryGrid } from '@masonry-grid/react';
import { ArtworkCardFrames } from './masonry/card/artwork-card-frames';
import { ArtworkSkeletonFrames } from './masonry/skeleton/artwork-skeleton-frames';
import { useInfiniteArtworks } from '@/hooks/use-infinite-artworks';
import { useResponsiveArtworkFrameWidth } from '@/hooks/use-responsive-artwork-frame-width';

export function ArtworkGrid() {
  const { artworks, loading, loadingMore, hasMore, sentinelRef } = useInfiniteArtworks();
  const frameWidth = useResponsiveArtworkFrameWidth();

  if (!loading && artworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-md text-muted-foreground">No artworks found. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <RegularMasonryGrid
        frameWidth={frameWidth}
        role="list"
        aria-label="Artwork grid"
        className="w-full gap-2 sm:gap-3 lg:gap-4"
      >
        {loading ? (
          <ArtworkSkeletonFrames variant="initial" />
        ) : (
          <>
            <ArtworkCardFrames artworks={artworks} />
            {loadingMore && <ArtworkSkeletonFrames variant="loading-more" />}
          </>
        )}
      </RegularMasonryGrid>

      {!loading && hasMore && <div ref={sentinelRef} className="min-h-1 w-full" aria-hidden />}
    </div>
  );
}
