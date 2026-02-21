import { FiSun, FiMoon } from 'react-icons/fi';
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
      {theme === 'light' ? <FiMoon size={size} /> : <FiSun size={size} />}
    </button>
  );
}
