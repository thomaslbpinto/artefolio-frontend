import { cn } from '@/lib/utils';

interface ArtworkCardProps {
  color: string;
  heightClass: string;
  className?: string;
}

export function ArtworkCard({ color, heightClass, className }: ArtworkCardProps) {
  return (
    <div
      className={cn(
        'relative w-full rounded-sm mb-2 sm:mb-3 lg:mb-4 break-inside-avoid overflow-hidden cursor-pointer',
        'transform-gpu transition-transform duration-900 ease-out hover:-translate-y-1 hover:scale-[1.015]',
        'before:absolute before:inset-0 before:bg-black/0 before:transition-colors before:duration-900 before:ease-out hover:before:bg-black/10',
        color,
        heightClass,
        className,
      )}
    />
  );
}
