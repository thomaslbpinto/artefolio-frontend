import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  size: LogoSize;
}

export const Logo = ({ size }: LogoProps) => {
  let textSize = '';

  if (size === 'sm') {
    textSize = 'text-2xl';
  } else if (size === 'md') {
    textSize = 'text-3xl';
  } else if (size === 'lg') {
    textSize = 'text-4xl';
  }

  return (
    <Link to="/" title="Go to home">
      <span>
        <div className={cn('flex flex-row select-none', textSize)}>
          <span className="font-extrabold text-primary">arte</span>
          <span className="font-extrabold text-foreground">folio</span>
        </div>
      </span>
    </Link>
  );
};
