import { cn } from '@/lib/utils';

interface ArtworkSkeletonCardProps {
  heightClass?: string;
  className?: string;
  fill?: boolean;
}

export function ArtworkSkeletonCard({ heightClass, className, fill }: ArtworkSkeletonCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-sm overflow-hidden bg-muted-foreground/20 animate-pulse',
        fill ? 'size-full' : 'w-full break-inside-avoid mb-2 sm:mb-3 lg:mb-4',
        !fill && heightClass,
        className,
      )}
    />
  );
}
