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
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-8 py-6">
      <main className="flex w-full max-w-md items-start text-start flex-col">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-primary mb-3">404</h1>
          <h2 className="text-xl font-semibold text-foreground">Page not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved
          </p>
        </div>

        <Button onClick={() => navigate(-1)}>Go back</Button>
      </main>
    </div>
  );
}
