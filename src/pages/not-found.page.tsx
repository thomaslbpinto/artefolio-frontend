import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-8 py-6 sm:gap-8 sm:px-6 sm:py-8">
      <main className="flex w-full max-w-md items-center text-center flex-col">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-6xl sm:text-7xl font-bold text-primary mb-3 sm:mb-4">404</h1>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Page not found</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved
          </p>
        </div>

        <div className="w-full space-y-2.5 sm:space-y-3">
          <Button onClick={() => navigate('/')}>Return to home</Button>
        </div>
      </main>
    </div>
  );
}
