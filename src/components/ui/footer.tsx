import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { ThemeToggle } from '@/components/theme.toggle';
import { Button } from './button';
import { HomeIcon } from './icons/home-icon';
import { CreateDropdownMenu } from './create-dropdown-menu';
import { ProfileIcon } from './icons/profile-icon';
import { SignOutIcon } from './icons/sign-out-icon';
import { cn } from '@/lib/utils';

export function Footer() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <footer
      className={cn(
        'fixed bottom-0 left-0 right-0 z-10 w-full border-t border-border bg-background',
        'sm:hidden py-2 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]',
      )}
      role="navigation"
      aria-label="Actions"
    >
      <nav className="flex h-full items-center justify-around gap-2">
        {user && <CreateDropdownMenu placement="top" createIconSize={22} />}
        <HomeIcon size={22} />
        <ThemeToggle size={22} />
        {user ? (
          <>
            <ProfileIcon size={22} />
            <SignOutIcon size={22} />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button className="w-fit text-xs" onClick={() => navigate('/sign-in')}>
              Sign in
            </Button>
            <Button variant="outline" className="w-fit text-xs" onClick={() => navigate('/sign-up')}>
              Sign up
            </Button>
          </div>
        )}
      </nav>
    </footer>
  );
}
