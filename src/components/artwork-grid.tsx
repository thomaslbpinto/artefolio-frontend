import { ArtworkCard } from './artwork-card';

interface MockArtworkItem {
  id: string;
  color: string;
  heightClass: string;
}

const COLORS = [
  'bg-gray-700',
  'bg-gray-600',
  'bg-gray-500',
  'bg-slate-700',
  'bg-slate-600',
  'bg-slate-500',
  'bg-neutral-700',
  'bg-neutral-600',
  'bg-neutral-500',
  'bg-stone-700',
  'bg-stone-600',
  'bg-stone-500',
];

const HEIGHTS = ['h-40', 'h-44', 'h-48', 'h-52', 'h-56', 'h-60', 'h-64', 'h-68', 'h-72', 'h-80'];

function getMockArtworkItems(count = 500): MockArtworkItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    heightClass: HEIGHTS[i % HEIGHTS.length],
  }));
}

export function ArtworkGrid() {
  return (
    <div
      className="gap-2 [column-width:150px] sm:gap-3 sm:[column-width:180px] lg:gap-4 lg:[column-width:220px]"
      role="list"
      aria-label="Artwork grid"
    >
      {getMockArtworkItems().map((item) => (
        <div key={item.id} className="break-inside-avoid" role="listitem">
          <ArtworkCard color={item.color} heightClass={item.heightClass} />
        </div>
      ))}
    </div>
  );
}
