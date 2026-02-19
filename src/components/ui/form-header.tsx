export function FormHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 sm:mb-6">
      <h1 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h1>
      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
