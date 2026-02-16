import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/contexts/theme.context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="cursor-pointer" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? <FiMoon size={24} /> : <FiSun size={24} />}
    </button>
  );
}
