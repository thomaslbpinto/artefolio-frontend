import { Frame } from '@masonry-grid/react';
import type { ArtworkCardFramesData } from '@/types/artwork.types';
import { ArtworkCard } from './artwork-card';

interface ArtworkCardFramesProps {
  artworks: ArtworkCardFramesData[];
}

export function ArtworkCardFrames({ artworks }: ArtworkCardFramesProps) {
  return (
    <>
      {artworks.map((artwork) => (
        <Frame key={artwork.id} width={artwork.width} height={artwork.height} as="div" role="listitem">
          <ArtworkCard
            imageUrl={artwork.imageUrl}
            title={artwork.title}
            width={artwork.width}
            height={artwork.height}
            fill
          />
        </Frame>
      ))}
    </>
  );
}
