import { useEffect, useState } from 'react';

export function useResponsiveArtworkFrameWidth(): number {
  const [frameWidth, setFrameWidth] = useState<number>(220);

  useEffect(() => {
    const sm = window.matchMedia('(min-width: 640px)');
    const lg = window.matchMedia('(min-width: 1024px)');

    const update = () => {
      if (lg.matches) {
        setFrameWidth(220);
      } else if (sm.matches) {
        setFrameWidth(180);
      } else {
        setFrameWidth(150);
      }
    };

    update();

    sm.addEventListener('change', update);
    lg.addEventListener('change', update);

    return () => {
      sm.removeEventListener('change', update);
      lg.removeEventListener('change', update);
    };
  }, []);

  return frameWidth;
}
