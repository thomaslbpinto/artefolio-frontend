import { cn } from '@/lib/utils';
import type { IconType } from 'react-icons';

export type IconButtonProps = {
  icon: IconType;
  size?: number;
  className?: string;
  title?: string;
  onClick: () => void;
  isActive?: boolean;
};

export function IconButton({ icon: Icon, size, className, title, onClick, isActive }: IconButtonProps) {
  const textColor = isActive ? 'text-foreground' : 'text-muted-foreground';
  const hoverColor = isActive ? 'hover:text-foreground/80' : 'hover:text-foreground';

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        'flex items-center justify-center transition-colors cursor-pointer',
        textColor,
        hoverColor,
        className,
      )}
    >
      <Icon size={size} />
    </button>
  );
}
