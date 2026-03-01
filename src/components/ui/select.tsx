import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LuChevronDown, LuX } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  id?: string;
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  renderOption?: (option: SelectOption) => ReactNode;
  renderFooter?: (onClose: () => void) => ReactNode;
};

const DROPDOWN_DESIRED_MAX_HEIGHT = 320;
const DROPDOWN_MIN_USABLE_HEIGHT = 140;
const DROPDOWN_MIN_HEIGHT = 96;
const VIEWPORT_EDGE_GAP = 12;
const TRIGGER_DROPDOWN_GAP = 4;

function getClampedDropdownHeight(availableSpace: number) {
  return Math.max(DROPDOWN_MIN_HEIGHT, Math.min(DROPDOWN_DESIRED_MAX_HEIGHT, Math.floor(availableSpace)));
}

function getViewportBottomLimit() {
  const footer = document.querySelector<HTMLElement>('footer[aria-label="Actions"]');

  if (!footer) {
    return window.innerHeight;
  }

  const styles = window.getComputedStyle(footer);
  if (styles.display === 'none' || styles.visibility === 'hidden') {
    return window.innerHeight;
  }

  const footerRect = footer.getBoundingClientRect();
  if (footerRect.height <= 0) {
    return window.innerHeight;
  }

  return Math.min(window.innerHeight, footerRect.top);
}

export function Select({
  id,
  name,
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  disabled,
  searchable = true,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found',
  className,
  renderOption,
  renderFooter,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(DROPDOWN_DESIRED_MAX_HEIGHT);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const triggerPointerDownRef = useRef(false);
  const focusFromClearRef = useRef(false);
  const listboxId = `${id ?? name ?? 'select'}-listbox`;
  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) {
      return options;
    }

    const normalizedSearch = search.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(normalizedSearch));
  }, [options, searchable, search]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function openDropdown() {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportBottomLimit = getViewportBottomLimit();
      const spaceBelow = viewportBottomLimit - rect.bottom - VIEWPORT_EDGE_GAP - TRIGGER_DROPDOWN_GAP;
      const spaceAbove = rect.top - VIEWPORT_EDGE_GAP - TRIGGER_DROPDOWN_GAP;

      const shouldDropUp = spaceBelow < DROPDOWN_MIN_USABLE_HEIGHT && spaceAbove > spaceBelow;
      setDropUp(shouldDropUp);

      const availableSpace = shouldDropUp ? spaceAbove : spaceBelow;
      setDropdownMaxHeight(getClampedDropdownHeight(availableSpace));
    }
    setOpen(true);
    setSearch('');
  }

  function handleToggle() {
    if (open) {
      setOpen(false);
      setSearch('');
      return;
    }

    openDropdown();
  }

  function handleTriggerFocus() {
    if (disabled || open || triggerPointerDownRef.current) {
      return;
    }
    if (focusFromClearRef.current) {
      focusFromClearRef.current = false;
      return;
    }

    openDropdown();
  }

  function handleTriggerClick() {
    triggerPointerDownRef.current = false;
    handleToggle();
    setSearch('');
  }

  function closeDropdownAndFocusTrigger() {
    setOpen(false);
    setSearch('');
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      if (open) {
        closeDropdownAndFocusTrigger();
      } else {
        handleToggle();
      }
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === ' ') {
      event.preventDefault();
      if (!open) {
        openDropdown();
      }
    }
  }

  function handleDropdownKeyDown(event: React.KeyboardEvent<HTMLDivElement | HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeDropdownAndFocusTrigger();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      const target = event.target as HTMLElement;
      const focusedOption = target.closest<HTMLButtonElement>('[data-option-value]');
      const inFooter = target.closest('[data-select-footer]');

      if (focusedOption?.dataset.optionValue != null) {
        handleSelect(focusedOption.dataset.optionValue);
        triggerRef.current?.focus();
      } else if (inFooter) {
        inFooter.querySelector<HTMLButtonElement>('button')?.click();
        closeDropdownAndFocusTrigger();
      } else {
        if (search.trim() && filteredOptions.length > 0) {
          handleSelect(filteredOptions[0].value);
          triggerRef.current?.focus();
        } else {
          closeDropdownAndFocusTrigger();
        }
      }
    }
  }

  function handleSelect(nextValue: string) {
    onValueChange(nextValue);
    setOpen(false);
    setSearch('');
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onBlurCapture={(event) => {
        const nextFocusedElement = event.relatedTarget as Node | null;
        const focusRemainsWithinContainer =
          !!nextFocusedElement && !!containerRef.current?.contains(nextFocusedElement);

        if (!focusRemainsWithinContainer) {
          setOpen(false);
          setSearch('');
        }
      }}
    >
      <div
        className={cn(
          'w-full flex items-center gap-2 border-border border-b-2 px-0 py-3 text-sm transition-colors duration-200 ease-out',
          open && 'border-primary',
          disabled && 'opacity-50',
        )}
      >
        {selectedOption ? (
          <button
            type="button"
            onClick={() => {
              focusFromClearRef.current = true;
              handleSelect('');
              triggerRef.current?.focus();
            }}
            className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            disabled={disabled}
            aria-label={`Clear ${name ?? 'selected'} option`}
          >
            <LuX size={14} />
          </button>
        ) : null}

        <button
          ref={triggerRef}
          id={id}
          name={name}
          type="button"
          onPointerDown={() => {
            triggerPointerDownRef.current = true;
          }}
          onFocus={handleTriggerFocus}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          className="w-full flex items-center justify-between gap-2 text-left cursor-pointer"
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
        >
          <span
            className={cn(
              'flex items-center gap-2 min-w-0 truncate',
              selectedOption ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {selectedOption ? (
              renderOption ? (
                renderOption(selectedOption)
              ) : (
                <span className="truncate">{selectedOption.label}</span>
              )
            ) : (
              <span className="truncate">{placeholder}</span>
            )}
          </span>
          <LuChevronDown className={cn('shrink-0 text-muted-foreground', open ? 'rotate-180' : '')} />
        </button>
      </div>

      {open && (
        <div
          className={cn(
            'absolute left-0 right-0 z-50 border border-border bg-background rounded-sm shadow-lg overflow-y-auto',
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1',
          )}
          style={{ maxHeight: `${dropdownMaxHeight}px` }}
          id={listboxId}
          role="listbox"
          aria-labelledby={id}
          onKeyDown={handleDropdownKeyDown}
        >
          {searchable ? (
            <div className="border-b border-border px-1 py-2">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleDropdownKeyDown}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full bg-transparent p-1 text-sm focus:outline-none transition-colors placeholder:text-muted-foreground"
              />
            </div>
          ) : null}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                data-option-value={option.value}
                role="option"
                aria-selected={value === option.value}
                className={cn(
                  'w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-border/50 transition-colors duration-200 cursor-pointer',
                  value === option.value && 'bg-border/50 text-foreground',
                )}
              >
                {renderOption ? renderOption(option) : option.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</div>
          )}

          {renderFooter ? (
            <div className="border-t border-border shrink-0" data-select-footer>
              {renderFooter(() => {
                setOpen(false);
                setSearch('');
              })}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
