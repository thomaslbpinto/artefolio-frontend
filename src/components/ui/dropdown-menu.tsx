import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type DropdownMenuItem = {
  id?: string;
  icon: ReactNode;
  title: string;
  description?: string;
  onSelect: () => void;
};

type DropdownMenuProps = {
  trigger: (props: { onToggle: () => void; open: boolean }) => ReactNode;
  title: string;
  items: DropdownMenuItem[];
  placement?: 'bottom' | 'top';
  className?: string;
  panelClassName?: string;
};

export function DropdownMenu({
  title,
  items,
  placement = 'bottom',
  className,
  panelClassName,
  trigger,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onToggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutsideDropdownMenu = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }

      close();
    };

    document.addEventListener('mousedown', handleClickOutsideDropdownMenu);

    return () => document.removeEventListener('mousedown', handleClickOutsideDropdownMenu);
  }, [open]);

  const handleItemSelect = (item: DropdownMenuItem) => {
    item.onSelect();
    close();
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {trigger({ onToggle, open })}
      {open && (
        <div
          className={cn(
            'absolute right-0 z-50 min-w-76 border border-border bg-background p-3 shadow-lg rounded-sm',
            placement === 'bottom' && 'top-full mt-2',
            placement === 'top' && 'bottom-full mb-2',
            panelClassName,
          )}
          role="menu"
          aria-label={title}
        >
          <p className="mb-1 px-2 py-1 text-lg font-bold text-foreground">{title}</p>
          <ul className="flex flex-col" role="none">
            {items.map((item, index) => (
              <li key={item.id ?? index} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleItemSelect(item)}
                  className={cn(
                    'flex w-full items-start justify-center gap-3 p-3 text-left',
                    'transition-colors hover:bg-foreground/5 cursor-pointer rounded-sm',
                  )}
                >
                  <span className="mt-1 flex items-center justify-center">{item.icon}</span>
                  <span className="min-w-0 flex-1 flex flex-col items-start">
                    <span className="text-md font-medium text-foreground">{item.title}</span>
                    {item.description && <span className="text-sm text-muted-foreground">{item.description}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
