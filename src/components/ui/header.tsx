import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '@/contexts/auth.context';
import { ThemeToggle } from '@/components/theme.toggle';
import { Logo } from '../logo';
import { Input } from './input';
import { Button } from './button';
import { HomeIcon } from './icons/home-icon';
import { CreateDropdownMenu } from './create-dropdown-menu';
import { ProfileIcon } from './icons/profile-icon';
import { SignOutIcon } from './icons/sign-out-icon';
import { cn } from '@/lib/utils';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-10 w-full border-b border-border bg-background',
        'h-12 py-2 px-3',
        'sm:h-14 sm:py-3 sm:px-4',
        'lg:h-16',
      )}
      role="navigation"
      aria-label="Actions"
    >
      <div className="flex h-full items-center gap-2 sm:gap-3 lg:gap-4">
        <div className="shrink-0">
          <span className="sm:hidden">
            <Logo size="sm" />
          </span>
          <span className="hidden sm:inline">
            <Logo size="md" />
          </span>
        </div>

        <div className="relative min-w-0 flex-1">
          <FiSearch
            size={18}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground sm:left-2.5"
            aria-hidden
          />
          <Input
            placeholder="Search..."
            aria-label="Search..."
            className="pl-7 border-0 py-0 text-sm sm:pl-8 sm:text-md"
          />
        </div>

        <div className="hidden shrink-0 items-center gap-5 sm:flex lg:gap-7">
          {user && <CreateDropdownMenu placement="bottom" createIconSize={24} />}
          <HomeIcon size={24} />
          <ThemeToggle size={24} />
          {user ? (
            <>
              <ProfileIcon size={24} />
              <SignOutIcon size={24} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button title="Sign in" className="w-fit" onClick={() => navigate('/sign-in')}>
                Sign in
              </Button>
              <Button title="Sign up" className="w-fit" onClick={() => navigate('/sign-up')} variant="outline">
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
