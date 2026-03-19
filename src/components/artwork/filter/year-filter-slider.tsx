import { useEffect, useRef, useState } from 'react';
import { LuCalendar } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ARTWORK_FILTER_YEAR_MAX, ARTWORK_FILTER_YEAR_MIN } from '@/constants/artwork-filter.constants';
import type { YearFilterValue } from '@/types/artwork-filter.types';
import { getYearDisplayLabel } from '@/lib/artwork-filter.utils';

type YearFilterSliderProps = {
  value: YearFilterValue;
  onChange: (value: YearFilterValue) => void;
  className?: string;
  triggerClassName?: string;
};

function getTriggerLabel(value: YearFilterValue): string {
  return getYearDisplayLabel(value.yearMin, value.yearMax) ?? 'Year';
}

export function YearFilterSlider({ value, onChange, className, triggerClassName }: YearFilterSliderProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'range' | 'single'>('range');
  const [rangeFrom, setRangeFrom] = useState<number>(value.yearMin ?? ARTWORK_FILTER_YEAR_MIN);
  const [rangeTo, setRangeTo] = useState<number>(value.yearMax ?? ARTWORK_FILTER_YEAR_MAX);
  const [rangeFromText, setRangeFromText] = useState<string>(String(value.yearMin ?? ARTWORK_FILTER_YEAR_MIN));
  const [rangeToText, setRangeToText] = useState<string>(String(value.yearMax ?? ARTWORK_FILTER_YEAR_MAX));
  const [singleYear, setSingleYear] = useState<string>(
    value.yearMin != null && value.yearMin === value.yearMax ? String(value.yearMin) : '',
  );
  const rootRef = useRef<HTMLDivElement>(null);

  const hasValue = value.yearMin != null || value.yearMax != null;

  function openPopover() {
    const initialFrom = value.yearMin ?? ARTWORK_FILTER_YEAR_MIN;
    const initialTo = value.yearMax ?? ARTWORK_FILTER_YEAR_MAX;
    setRangeFrom(initialFrom);
    setRangeTo(initialTo);
    setRangeFromText(String(initialFrom));
    setRangeToText(String(initialTo));
    setSingleYear(value.yearMin != null && value.yearMin === value.yearMax ? String(value.yearMin) : '');
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const from = Math.min(rangeFrom, rangeTo);
  const to = Math.max(rangeFrom, rangeTo);
  const yearRange = ARTWORK_FILTER_YEAR_MAX - ARTWORK_FILTER_YEAR_MIN;
  const fillLeft = ((from - ARTWORK_FILTER_YEAR_MIN) / yearRange) * 100;
  const fillWidth = ((to - from) / yearRange) * 100;

  function normalizeRange(fromValue: number, toValue: number): { from: number; to: number } {
    let nextFrom = Math.min(Math.max(fromValue, ARTWORK_FILTER_YEAR_MIN), ARTWORK_FILTER_YEAR_MAX);
    let nextTo = Math.min(Math.max(toValue, ARTWORK_FILTER_YEAR_MIN), ARTWORK_FILTER_YEAR_MAX);

    if (nextFrom > nextTo) {
      [nextFrom, nextTo] = [nextTo, nextFrom];
    }

    return { from: nextFrom, to: nextTo };
  }

  function apply() {
    if (mode === 'range') {
      const parsedFrom = Number.parseInt(rangeFromText, 10);
      const parsedTo = Number.parseInt(rangeToText, 10);

      if (Number.isNaN(parsedFrom) && Number.isNaN(parsedTo)) {
        onChange({ yearMin: undefined, yearMax: undefined });
        setOpen(false);
        return;
      }

      const baseFrom = Number.isNaN(parsedFrom) ? rangeFrom : parsedFrom;
      const baseTo = Number.isNaN(parsedTo) ? rangeTo : parsedTo;

      const { from: nextFrom, to: nextTo } = normalizeRange(baseFrom, baseTo);

      setRangeFrom(nextFrom);
      setRangeTo(nextTo);
      setRangeFromText(String(nextFrom));
      setRangeToText(String(nextTo));

      onChange({ yearMin: nextFrom, yearMax: nextTo });
    } else {
      const y = singleYear.trim() ? parseInt(singleYear, 10) : undefined;
      if (y != null && !Number.isNaN(y) && y >= ARTWORK_FILTER_YEAR_MIN && y <= ARTWORK_FILTER_YEAR_MAX) {
        onChange({ yearMin: y, yearMax: y });
      } else {
        onChange({ yearMin: undefined, yearMax: undefined });
      }
    }
    setOpen(false);
  }

  function clear() {
    setRangeFrom(ARTWORK_FILTER_YEAR_MIN);
    setRangeTo(ARTWORK_FILTER_YEAR_MAX);
    setRangeFromText(String(ARTWORK_FILTER_YEAR_MIN));
    setRangeToText(String(ARTWORK_FILTER_YEAR_MAX));
    setSingleYear('');
    onChange({ yearMin: undefined, yearMax: undefined });
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPopover())}
        className={cn(
          'flex w-full items-center gap-2 h-9 text-sm cursor-pointer',
          triggerClassName,
          open && 'border-primary',
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Filter by year"
      >
        <LuCalendar size={14} className="shrink-0 text-muted-foreground" aria-hidden />
        <span className={cn('truncate', !hasValue && 'text-muted-foreground')}>{getTriggerLabel(value)}</span>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 z-50 mt-2 w-72 rounded-sm border border-border bg-background p-4 shadow-lg"
          role="dialog"
          aria-labelledby="year-filter-title"
        >
          <div className="relative flex border border-border bg-border/50 p-1 rounded-sm w-full">
            <div
              className={cn(
                'absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-sm shadow-md transition-all duration-300 ease-out',
                mode === 'range' ? 'left-1' : 'left-[50%]',
              )}
            />
            <button
              type="button"
              onClick={() => setMode('range')}
              className={cn(
                'flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-sm relative transition-colors duration-200 cursor-pointer',
                mode === 'range' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Range
            </button>
            <button
              type="button"
              onClick={() => setMode('single')}
              className={cn(
                'flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-sm relative transition-colors duration-200 cursor-pointer',
                mode === 'single' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Exact year
            </button>
          </div>

          {mode === 'range' ? (
            <div className="mt-3 space-y-3">
              <div className="flex justify-between text-sm font-medium text-foreground">
                <span>{from}</span>
                <span>{to}</span>
              </div>
              <div className="relative h-4 pt-2 pb-4">
                <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
                <div
                  className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary pointer-events-none"
                  style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
                />
                <input
                  type="range"
                  min={ARTWORK_FILTER_YEAR_MIN}
                  max={ARTWORK_FILTER_YEAR_MAX}
                  value={from}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    const { from: nextFrom, to: nextTo } = normalizeRange(v, rangeTo);
                    setRangeFrom(nextFrom);
                    setRangeTo(nextTo);
                    setRangeFromText(String(nextFrom));
                    setRangeToText(String(nextTo));
                  }}
                  className="absolute left-0 right-0 top-1/2 h-4 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow"
                />
                <input
                  type="range"
                  min={ARTWORK_FILTER_YEAR_MIN}
                  max={ARTWORK_FILTER_YEAR_MAX}
                  value={to}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    const { from: nextFrom, to: nextTo } = normalizeRange(rangeFrom, v);
                    setRangeFrom(nextFrom);
                    setRangeTo(nextTo);
                    setRangeFromText(String(nextFrom));
                    setRangeToText(String(nextTo));
                  }}
                  className="absolute left-0 right-0 top-1/2 h-4 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={ARTWORK_FILTER_YEAR_MIN}
                  max={ARTWORK_FILTER_YEAR_MAX}
                  value={rangeFromText}
                  onChange={(e) => {
                    setRangeFromText(e.target.value);
                    const n = Number.parseInt(e.target.value, 10);
                    if (!Number.isNaN(n)) {
                      const { from: nextFrom, to: nextTo } = normalizeRange(n, rangeTo);
                      setRangeFrom(nextFrom);
                      setRangeTo(nextTo);
                      setRangeToText(String(nextTo));
                    }
                  }}
                  className="h-8 flex-1 text-center text-sm border border-border rounded-sm"
                />
                <span className="text-xs text-muted-foreground">-</span>
                <Input
                  type="number"
                  min={ARTWORK_FILTER_YEAR_MIN}
                  max={ARTWORK_FILTER_YEAR_MAX}
                  value={rangeToText}
                  onChange={(e) => {
                    setRangeToText(e.target.value);
                    const n = Number.parseInt(e.target.value, 10);
                    if (!Number.isNaN(n)) {
                      const { from: nextFrom, to: nextTo } = normalizeRange(rangeFrom, n);
                      setRangeFrom(nextFrom);
                      setRangeTo(nextTo);
                      setRangeFromText(String(nextFrom));
                    }
                  }}
                  className="h-8 flex-1 text-center text-sm border border-border rounded-sm"
                />
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <Input
                type="number"
                placeholder="2019"
                min={ARTWORK_FILTER_YEAR_MIN}
                max={ARTWORK_FILTER_YEAR_MAX}
                value={singleYear}
                onChange={(event) => setSingleYear(event.target.value)}
                className="h-9 text-center text-sm border border-border rounded-sm"
              />
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={clear}>
              Clear
            </Button>
            <Button type="button" className="flex-1" onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
