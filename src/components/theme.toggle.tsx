import { LuSun, LuMoon } from 'react-icons/lu';
import { useTheme } from '@/contexts/theme.context';

export function ThemeToggle({ size }: { size: number }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      title="Toggle theme"
      className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <LuMoon size={size} /> : <LuSun size={size} />}
    </button>
  );
}
