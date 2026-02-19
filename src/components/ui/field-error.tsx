export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-[11px] sm:text-xs text-error mt-1">{message}</p>;
}
