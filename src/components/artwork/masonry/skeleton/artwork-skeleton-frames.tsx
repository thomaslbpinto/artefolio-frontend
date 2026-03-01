import { MasonrySkeletonFrames } from '@/components/ui/masonry-skeleton-frames';
import { ArtworkSkeletonCard } from './artwork-skeleton-card';

const INITIAL_SKELETON_COUNT = 24;
const LOADING_MORE_SKELETON_COUNT = 18;

const ARTWORK_SKELETON_FRAME_RATIOS: ReadonlyArray<[number, number]> = [
  [1, 1],
  [2, 3],
  [3, 2],
];

type ArtworkSkeletonFramesVariant = 'initial' | 'loading-more';

interface ArtworkSkeletonFramesProps {
  variant: ArtworkSkeletonFramesVariant;
}

export function ArtworkSkeletonFrames({ variant }: ArtworkSkeletonFramesProps) {
  return (
    <MasonrySkeletonFrames
      count={variant === 'initial' ? INITIAL_SKELETON_COUNT : LOADING_MORE_SKELETON_COUNT}
      ratios={ARTWORK_SKELETON_FRAME_RATIOS}
      skeleton={ArtworkSkeletonCard}
    />
  );
}
