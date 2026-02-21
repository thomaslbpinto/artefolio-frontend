import { Link, useLocation, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { IconType } from 'react-icons';

export type IconLinkProps = LinkProps & {
  icon: IconType;
  size?: number;
  className?: string;
};

export function IconLink({ icon: Icon, size, className, ...props }: IconLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === props.to;

  const textColor = isActive ? 'text-foreground' : 'text-muted-foreground';
  const hoverColor = isActive ? 'hover:text-foreground/80' : 'hover:text-foreground';

  return (
    <Link
      {...props}
      className={cn('flex items-center justify-center transition-colors', textColor, hoverColor, className)}
    >
      <Icon size={size} />
    </Link>
  );
}
