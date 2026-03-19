import { cn } from '@/lib/utils';
import type { MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';

type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  size: LogoSize;
}

export const Logo = ({ size }: LogoProps) => {
  const location = useLocation();

  let textSize = '';
  if (size === 'sm') {
    textSize = 'text-2xl';
  } else if (size === 'md') {
    textSize = 'text-3xl';
  } else if (size === 'lg') {
    textSize = 'text-4xl';
  }

  const handleLogoClick = (event: MouseEvent) => {
    if (location.pathname === '/') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link to="/" title="Go to home" onClick={handleLogoClick}>
      <span>
        <div className={cn('flex flex-row select-none leading-none', textSize)}>
          <span className="font-extrabold text-primary">arte</span>
          <span className="font-extrabold text-foreground">folio</span>
        </div>
      </span>
    </Link>
  );
};
