import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { ThemeToggle } from '@/components/theme.toggle';
import { Logo } from '../logo';
import { Button } from './button';
import { HomeIcon } from './icons/home-icon';
import { CreateDropdownMenu } from '../create-dropdown-menu';
import { ProfileIcon } from './icons/profile-icon';
import { SignOutIcon } from './icons/sign-out-icon';
import { cn } from '@/lib/utils';
import { SearchIcon } from './icons/search-icon';
import { ArtworkFilterBar } from '../artwork/filter/artwork-filter-bar';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnHome = location.pathname === '/';

  const [filterBarOpen, setFilterBarOpen] = useState(false);

  useEffect(() => {
    if (isOnHome && location.state?.openFilterBar) {
      setTimeout(() => {
        setFilterBarOpen(true);
        delete location.state?.openFilterBar;
      }, 50);
    }
  }, [isOnHome, location.state]);

  function handleSearchIconClick() {
    if (isOnHome) {
      setFilterBarOpen((prev) => !prev);
    } else {
      navigate({ pathname: '/', search: window.location.search }, { state: { openFilterBar: true } });
    }
  }

  return (
    <header
      className={cn('sticky top-0 z-51 w-full border-b border-border bg-background')}
      role="navigation"
      aria-label="Actions"
    >
      <div className="flex items-center justify-between gap-2 py-2 sm:gap-3 sm:py-3 lg:gap-4 px-3 sm:px-4">
        <div className="shrink-0">
          <span className="sm:hidden">
            <Logo size="sm" />
          </span>
          <span className="hidden sm:inline">
            <Logo size="md" />
          </span>
        </div>

        <div className="hidden shrink-0 items-center gap-5 sm:flex lg:gap-7">
          <SearchIcon size={24} onClick={handleSearchIconClick} />
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

      {isOnHome && <ArtworkFilterBar open={filterBarOpen} />}
    </header>
  );
}
