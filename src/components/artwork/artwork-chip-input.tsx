import { useEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react';
import { LuX } from 'react-icons/lu';
import { FieldError } from '@/components/ui/field-error';
import { cn } from '@/lib/utils';

type ArtworkChipInputProps = {
  value: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onChange: (value: string[]) => void;
  maxItems: number;
  maxItemLength?: number;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  onErrorChange?: (message?: string) => void;
  options?: readonly string[];
  noOptionsText?: string;
  validateValue?: (value: string) => string | undefined;
  summaryOnly?: boolean;
  triggerClassName?: string;
  searchable?: boolean;
  renderItemLeading?: (item: string) => ReactNode;
  renderItemLeadingInListOnly?: boolean;
};

type AddChipConfig = {
  refocusInput?: boolean;
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

export function ArtworkChipInput({
  value,
  inputValue,
  onInputChange,
  onChange,
  maxItems,
  maxItemLength,
  placeholder,
  disabled,
  error,
  onErrorChange,
  options,
  noOptionsText = 'No results found',
  validateValue,
  summaryOnly = false,
  triggerClassName,
  searchable = false,
  renderItemLeading,
  renderItemLeadingInListOnly = false,
}: ArtworkChipInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(DROPDOWN_DESIRED_MAX_HEIGHT);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const justSelectedFromListRef = useRef(false);
  const closingWithEscapeRef = useRef(false);
  const hasSelectableOptions = Array.isArray(options);
  const canType = !disabled && value.length < maxItems;

  function openDropdown() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportBottomLimit = getViewportBottomLimit();
      const spaceBelow = viewportBottomLimit - rect.bottom - VIEWPORT_EDGE_GAP - TRIGGER_DROPDOWN_GAP;
      const spaceAbove = rect.top - VIEWPORT_EDGE_GAP - TRIGGER_DROPDOWN_GAP;

      const shouldDropUp = spaceBelow < DROPDOWN_MIN_USABLE_HEIGHT && spaceAbove > spaceBelow;
      setDropUp(shouldDropUp);

      const availableSpace = shouldDropUp ? spaceAbove : spaceBelow;
      setDropdownMaxHeight(getClampedDropdownHeight(availableSpace));
    }
    setIsFocused(true);
  }

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (justSelectedFromListRef.current) {
        justSelectedFromListRef.current = false;
        return;
      }

      const target = event.target as Node;

      if (rootRef.current && !rootRef.current.contains(target)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFocused]);

  const filteredOptions = useMemo(() => {
    if (!hasSelectableOptions) {
      return [];
    }

    const query = searchable ? inputValue.trim().toLowerCase() : '';

    return options.filter((option) => {
      const isAlreadySelected = value.some((selected) => selected.toLowerCase() === option.toLowerCase());

      if (isAlreadySelected) {
        return false;
      }

      if (!query) {
        return true;
      }

      return option.toLowerCase().includes(query);
    });
  }, [hasSelectableOptions, searchable, inputValue, options, value]);

  function setError(message?: string) {
    onErrorChange?.(message);
  }

  function focusInput() {
    setTimeout(() => {
      if (hasSelectableOptions && canType && searchable) {
        searchInputRef.current?.focus();
        setIsFocused(true);
      } else {
        inputRef.current?.focus();
        setIsFocused(true);
      }
    }, 0);
  }

  function closeDropdownAndFocusMainInput() {
    closingWithEscapeRef.current = true;
    setIsFocused(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function addChip(rawValue: string, config: AddChipConfig = {}) {
    const { refocusInput = false } = config;

    if (!canType) {
      setError(`Maximum of ${maxItems} items allowed`);
      return;
    }

    const trimmedValue = rawValue.trim();
    if (!trimmedValue) {
      return;
    }

    const selectedValue = hasSelectableOptions
      ? (options.find((option) => option.toLowerCase() === trimmedValue.toLowerCase()) ?? filteredOptions[0])
      : trimmedValue;

    if (!selectedValue) {
      setError(undefined);
      setIsFocused(false);
      return;
    }

    if (maxItemLength && selectedValue.length > maxItemLength) {
      setError(`Value must be at most ${maxItemLength} characters`);
      return;
    }

    const customValidationError = validateValue?.(selectedValue);
    if (customValidationError) {
      setError(customValidationError);
      return;
    }

    const hasDuplicate = value.some((item) => item.toLowerCase() === selectedValue.toLowerCase());
    if (hasDuplicate) {
      setError('This item already exists');
      return;
    }

    onChange([...value, selectedValue]);
    onInputChange('');
    setError(undefined);

    if (refocusInput) {
      focusInput();
    }
  }

  function removeChip(valueToRemove: string) {
    onChange(value.filter((item) => item !== valueToRemove));
    setError(undefined);

    focusInput();
  }

  function commitPendingInput() {
    if (!inputValue.trim()) {
      return;
    }

    addChip(inputValue);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      if (hasSelectableOptions && isFocused) {
        event.preventDefault();
        event.stopPropagation();
        closeDropdownAndFocusMainInput();
      }
      return;
    }

    if ((event.key === 'Enter' || event.key === ',') && inputValue.trim()) {
      event.preventDefault();
      addChip(inputValue, { refocusInput: true });
      return;
    }

    if (event.key === 'Backspace' && !inputValue.trim() && value.length > 0) {
      event.preventDefault();
      removeChip(value[value.length - 1]);
    }
  }

  const shouldShowOptions = hasSelectableOptions && isFocused && canType;

  const isInputFocused = isFocused && canType;
  const atMax = value.length >= maxItems;
  const displayValue = hasSelectableOptions ? '' : inputValue;
  const shouldUseFullWidthInput = value.length === 0 && (hasSelectableOptions ? true : !inputValue.trim());
  const inputWidthCh = hasSelectableOptions ? 2 : Math.max(2, inputValue.length + 1);

  return (
    <div
      ref={rootRef}
      onBlurCapture={(event: FocusEvent<HTMLDivElement>) => {
        const nextFocusedElement = event.relatedTarget as Node | null;
        const focusRemainsWithinRoot = !!nextFocusedElement && rootRef.current?.contains(nextFocusedElement);

        if (focusRemainsWithinRoot) {
          return;
        }

        commitPendingInput();
        setIsFocused(false);
      }}
    >
      <div className="relative">
        <div
          ref={triggerRef}
          className={cn(
            'w-full py-3 text-sm transition-colors flex flex-wrap items-center gap-1.5 cursor-text',
            !triggerClassName && 'bg-transparent border-border border-b-2',
            !triggerClassName && isInputFocused && !atMax && 'border-primary',
            triggerClassName,
            triggerClassName && isFocused && !atMax && 'border-primary',
          )}
          onMouseDown={(event) => {
            const target = event.target as HTMLElement;
            if (target.closest('button')) {
              return;
            }

            event.preventDefault();

            if (canType) {
              if (hasSelectableOptions) {
                openDropdown();
                if (searchable) {
                  setTimeout(() => searchInputRef.current?.focus(), 0);
                } else {
                  setTimeout(() => inputRef.current?.focus(), 0);
                }
              } else {
                inputRef.current?.focus();
                setIsFocused(true);
              }
            } else if (hasSelectableOptions) {
              openDropdown();
              if (searchable) {
                setTimeout(() => searchInputRef.current?.focus(), 0);
              } else {
                setTimeout(() => inputRef.current?.focus(), 0);
              }
            }
          }}
        >
          {summaryOnly && (
            <span
              className={cn(
                'min-h-0 shrink-0 bg-transparent text-sm flex items-center gap-1.5',
                atMax ? 'text-muted-foreground' : value.length > 0 ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {value.length > 0 ? (
                renderItemLeading && !renderItemLeadingInListOnly ? (
                  <>
                    {value.map((item) => (
                      <span key={item} className="flex items-center gap-1.5 shrink-0">
                        {renderItemLeading(item)}
                        <span className="truncate">{item}</span>
                      </span>
                    ))}
                  </>
                ) : (
                  `${value.length} selected`
                )
              ) : (
                placeholder
              )}
            </span>
          )}
          {summaryOnly && value.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onChange([]);
                onInputChange('');
                setError(undefined);
                setIsFocused(false);
              }}
              className="ml-auto flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <LuX size={14} />
            </button>
          )}
          {!summaryOnly &&
            value.map((item) => (
              <span
                key={item}
                className={cn(
                  'flex h-6 items-center gap-1 shrink-0 bg-border/50 border border-border leading-none',
                  'text-foreground text-xs leading-none px-2.5 rounded-full',
                )}
              >
                {!renderItemLeadingInListOnly && renderItemLeading?.(item)}
                <span className="truncate">{item}</span>
                <button
                  type="button"
                  onClick={() => removeChip(item)}
                  className="flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label={`Remove ${item}`}
                  disabled={disabled}
                >
                  <LuX size={12} />
                </button>
              </span>
            ))}

          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={(event) => {
              onInputChange(event.target.value);
              setError(undefined);
              if (hasSelectableOptions && canType) {
                setIsFocused(true);
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (closingWithEscapeRef.current) {
                closingWithEscapeRef.current = false;
                return;
              }
              if (hasSelectableOptions && canType) {
                openDropdown();
                if (searchable) {
                  setTimeout(() => searchInputRef.current?.focus(), 0);
                }
              } else {
                setIsFocused(true);
              }
            }}
            onClick={() => {
              if (canType) {
                if (hasSelectableOptions) {
                  openDropdown();
                } else {
                  setIsFocused(true);
                }
              }
            }}
            placeholder={summaryOnly ? undefined : value.length === 0 ? placeholder : ''}
            disabled={!canType}
            tabIndex={value.length >= maxItems || (hasSelectableOptions && shouldShowOptions) ? -1 : 0}
            className={cn(
              'min-h-0 shrink-0 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none caret-transparent',
              atMax ? 'min-w-0 w-0 overflow-hidden' : 'max-w-full',
              summaryOnly && 'absolute opacity-0 w-0 min-w-0 pointer-events-none',
            )}
            style={
              summaryOnly
                ? undefined
                : atMax
                  ? undefined
                  : {
                      width: shouldUseFullWidthInput ? '100%' : `${inputWidthCh}ch`,
                    }
            }
            aria-label={summaryOnly ? placeholder : undefined}
          />
        </div>
        {!summaryOnly && (
          <span
            className="absolute -top-5 right-0 text-xs font-medium text-muted-foreground pointer-events-none"
            aria-hidden
          >
            {value.length} / {maxItems}
          </span>
        )}

        {shouldShowOptions && (
          <div
            className={cn(
              'absolute left-0 right-0 z-50 overflow-y-auto rounded-md border border-border bg-background shadow-md',
              dropUp ? 'bottom-full mb-1' : 'top-full mt-1',
            )}
            style={{ maxHeight: `${dropdownMaxHeight}px` }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                closeDropdownAndFocusMainInput();
              }
            }}
          >
            {searchable && (
              <div className="sticky top-0 z-10 border-b border-border bg-background px-1 py-2">
                <input
                  ref={searchInputRef}
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(event) => {
                    onInputChange(event.target.value);
                    setError(undefined);
                    if (hasSelectableOptions && canType) {
                      setIsFocused(true);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search..."
                  aria-label={placeholder}
                  className="w-full bg-transparent p-1 text-sm focus:outline-none transition-colors placeholder:text-muted-foreground"
                />
              </div>
            )}
            <div className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onMouseDown={(event) => {
                      justSelectedFromListRef.current = true;
                      event.preventDefault();
                    }}
                    onClick={() => {
                      addChip(option, { refocusInput: true });
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter') {
                        return;
                      }

                      event.preventDefault();
                      event.stopPropagation();
                      addChip(option, { refocusInput: true });
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-border/50 cursor-pointer flex items-center gap-2"
                  >
                    {renderItemLeading?.(option)}
                    <span className="truncate">{option}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">{noOptionsText}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <FieldError message={error} />
    </div>
  );
}
