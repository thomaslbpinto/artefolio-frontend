import { Frame } from '@masonry-grid/react';
import type { ComponentType } from 'react';

interface MasonrySkeletonFramesProps {
  count: number;
  ratios: ReadonlyArray<[number, number]>;
  skeleton: ComponentType<{ fill?: boolean }>;
}

function randomRatio(ratios: ReadonlyArray<[number, number]>): [number, number] {
  return ratios[Math.floor(Math.random() * ratios.length)];
}

export function MasonrySkeletonFrames({ count, ratios, skeleton: Skeleton }: MasonrySkeletonFramesProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const [width, height] = randomRatio(ratios);
        return (
          <Frame key={`skeleton-${i}`} width={width} height={height} as="div" role="listitem">
            <Skeleton fill />
          </Frame>
        );
      })}
    </>
  );
}
