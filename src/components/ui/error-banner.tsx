export function ErrorBanner({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-4 border border-error-border bg-error-background p-3">
      <p className="text-xs text-error sm:text-sm">{message}</p>
    </div>
  );
}
