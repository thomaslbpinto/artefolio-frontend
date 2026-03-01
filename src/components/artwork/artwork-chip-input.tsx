import { useEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
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
};

type AddChipConfig = {
  refocusInput?: boolean;
};

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
}: ArtworkChipInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justSelectedFromListRef = useRef(false);
  const hasSelectableOptions = Array.isArray(options);
  const canType = !disabled && value.length < maxItems;

  useEffect(() => {
    const showOptions = hasSelectableOptions && isFocused && canType;

    if (!showOptions) {
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
  }, [hasSelectableOptions, isFocused, canType]);

  const filteredOptions = useMemo(() => {
    if (!hasSelectableOptions) {
      return [];
    }

    const query = inputValue.trim().toLowerCase();

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
  }, [hasSelectableOptions, inputValue, options, value]);

  function setError(message?: string) {
    onErrorChange?.(message);
  }

  function focusInput() {
    setTimeout(() => {
      inputRef.current?.focus();
      setIsFocused(true);
    }, 0);
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
  const shouldUseFullWidthInput = value.length === 0 && !inputValue.trim();
  const inputWidthCh = Math.max(2, inputValue.length + 1);

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
          className={cn(
            'w-full py-3 bg-transparent border-border border-b-2 text-sm transition-colors',
            'flex flex-wrap items-center gap-1.5 cursor-text',
            isInputFocused && 'border-primary',
          )}
          onMouseDown={(event) => {
            const target = event.target as HTMLElement;
            if (target.closest('button')) {
              return;
            }

            event.preventDefault();
            if (canType) {
              inputRef.current?.focus();
              setIsFocused(true);
            }
          }}
        >
          {value.map((item) => (
            <span
              key={item}
              className={cn(
                'flex h-6 items-center gap-1 shrink-0 bg-border/50 border border-border',
                'text-foreground text-xs leading-none px-2.5 rounded-full',
              )}
            >
              {item}
              <button
                type="button"
                onClick={() => removeChip(item)}
                className="flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                disabled={disabled}
              >
                <LuX size={12} />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
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
            onFocus={() => setIsFocused(true)}
            onClick={() => canType && setIsFocused(true)}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={!canType}
            tabIndex={value.length >= maxItems ? -1 : 0}
            className={cn(
              'min-h-0 shrink-0 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none',
              atMax ? 'min-w-0 w-0 overflow-hidden' : 'max-w-full',
            )}
            style={
              atMax
                ? undefined
                : {
                    width: shouldUseFullWidthInput ? '100%' : `${inputWidthCh}ch`,
                  }
            }
          />
        </div>
        <span
          className="absolute -top-5 right-0 text-xs font-medium text-muted-foreground pointer-events-none"
          aria-hidden
        >
          {value.length} / {maxItems}
        </span>

        {shouldShowOptions && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-44 overflow-y-auto rounded-md border border-border bg-background py-1 shadow-md">
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
                  className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-border/50 cursor-pointer"
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">{noOptionsText}</div>
            )}
          </div>
        )}
      </div>

      <FieldError message={error} />
    </div>
  );
}
