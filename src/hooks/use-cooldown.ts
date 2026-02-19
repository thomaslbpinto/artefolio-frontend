import { useEffect, useState } from 'react';

export function useCooldown() {
  const [cooldownEndsAt, setCooldownEndsAt] = useState<Date | null>(null);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);

  function startCooldown(seconds = 60) {
    setCooldownEndsAt(new Date(Date.now() + seconds * 1000));
  }

  useEffect(() => {
    if (!cooldownEndsAt) {
      return;
    }

    const tick = () => {
      const secondsLeft = Math.ceil((cooldownEndsAt.getTime() - Date.now()) / 1000);
      if (secondsLeft <= 0) {
        setCooldownSecondsLeft(0);
        setCooldownEndsAt(null);
      } else {
        setCooldownSecondsLeft(secondsLeft);
      }
    };

    tick();

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [cooldownEndsAt]);

  return { cooldownSecondsLeft, startCooldown };
}
