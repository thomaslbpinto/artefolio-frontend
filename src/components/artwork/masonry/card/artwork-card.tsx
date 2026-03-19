import { cn } from '@/lib/utils';

interface ArtworkCardProps {
  imageUrl: string;
  title: string;
  width: number;
  height: number;
  className?: string;
  fill?: boolean;
}

export function ArtworkCard({ imageUrl, title, width, height, className, fill }: ArtworkCardProps) {
  const aspectRatio = width && height ? width / height : 1;

  return (
    <div
      className={cn(
        'relative overflow-hidden cursor-pointer rounded-sm',
        !fill && 'w-full break-inside-avoid mb-2 sm:mb-3 lg:mb-4',
        fill && 'size-full',
        'before:absolute before:inset-0 before:bg-black/0 before:transition-colors',
        'before:duration-900 before:ease-out hover:before:bg-black/10',
        className,
      )}
      style={fill ? undefined : { aspectRatio: `${aspectRatio}` }}
    >
      <img
        src={imageUrl}
        alt={title}
        className={cn(
          'absolute inset-0 size-full object-cover object-center',
          'transform-gpu transition-transform duration-900 ease-out hover:scale-[1.015]',
        )}
        loading="lazy"
      />
    </div>
  );
}
