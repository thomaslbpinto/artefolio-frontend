import { useEffect, useRef, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { LuChevronDown, LuChevronUp } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import { FieldError } from '@/components/ui/field-error';
import { Label } from '@/components/ui/label';
import { Select, type SelectOption } from '@/components/ui/select';
import { ArtworkChipInput } from '@/components/artwork/artwork-chip-input';
import { cn } from '@/lib/utils';
import { ARTWORK_GENRES, ARTWORK_TECHNIQUES, ArtworkType } from '@/types/artwork.types';
import type { ArtworkFormData, ArtworkFormErrors } from '@/hooks/use-create-artwork-form';
import { Textarea } from '../ui/textarea';
import countries from '@/constants/countries-en.json';

type ArtworkTechnicalDetailsProps = {
  formData: ArtworkFormData;
  errors: ArtworkFormErrors;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onCountryChange?: (value: string) => void;
  onGenreChange: (value: string[]) => void;
  onTechniqueChange: (value: string[]) => void;
  onYearBlur?: () => void;
  onYearChange?: () => void;
  open: boolean;
  onToggle: () => void;
  disabled: boolean;
  currentYear: number;
  maxArtworkGenres: number;
  maxArtworkTechniques: number;
};

const COUNTRIES_LIST = countries as { alpha2: string; name: string }[];

const COUNTRY_OPTIONS: SelectOption[] = COUNTRIES_LIST.map((c) => ({
  value: c.name,
  label: c.name,
}));

function getAlpha2ByCountryName(name: string): string | undefined {
  return COUNTRIES_LIST.find((c) => c.name === name)?.alpha2;
}

export function ArtworkTechnicalDetails({
  formData,
  errors,
  onChange,
  onCountryChange,
  onGenreChange,
  onTechniqueChange,
  onYearBlur,
  onYearChange,
  open,
  onToggle,
  disabled,
  currentYear,
  maxArtworkGenres,
  maxArtworkTechniques,
}: ArtworkTechnicalDetailsProps) {
  const [genreInputValue, setGenreInputValue] = useState('');
  const [techniqueInputValue, setTechniqueInputValue] = useState('');
  const [genreError, setGenreError] = useState<string | undefined>();
  const [techniqueError, setTechniqueError] = useState<string | undefined>();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = contentRef.current;

    if (!element) {
      return;
    }

    if (open) {
      element.removeAttribute('inert');
    } else {
      element.setAttribute('inert', '');
    }
  }, [open]);

  return (
    <div className="pt-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left cursor-pointer py-1 -mx-1 px-1"
      >
        <span className="text-sm font-medium text-foreground">Technical Details</span>
        {open ? (
          <LuChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <LuChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <div
        ref={contentRef}
        className={cn(
          'transition-all duration-300 ease-in-out space-y-3 sm:space-y-3.5',
          open ? 'max-h-[600px] opacity-100 mt-2 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden',
        )}
      >
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              name="year"
              type="number"
              value={formData.year}
              onChange={(e) => {
                onChange(e);
                onYearChange?.();
              }}
              onBlur={onYearBlur}
              placeholder={String(currentYear)}
              min={1}
              max={currentYear}
              disabled={disabled}
            />
            <FieldError message={errors.year} />
          </div>

          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label htmlFor="country">Country</Label>
            <Select
              id="country"
              name="country"
              value={formData.country}
              onValueChange={(value) => onCountryChange?.(value)}
              options={COUNTRY_OPTIONS}
              placeholder="Select a country"
              disabled={disabled}
              searchable
              searchPlaceholder="Search country..."
              renderOption={(option) => {
                const alpha2 = getAlpha2ByCountryName(option.value);
                return (
                  <>
                    {alpha2 && (
                      <ReactCountryFlag
                        countryCode={alpha2}
                        title={option.label}
                        svg
                        style={{ width: '1.4em', height: '1.4em' }}
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </>
                );
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="genre">Genre</Label>
            <ArtworkChipInput
              value={formData.genre}
              inputValue={genreInputValue}
              onInputChange={setGenreInputValue}
              onChange={onGenreChange}
              maxItems={maxArtworkGenres}
              options={ARTWORK_GENRES}
              placeholder="Search genres"
              disabled={disabled}
              error={genreError ?? errors.genre}
              onErrorChange={setGenreError}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="technique">Technique</Label>
            <ArtworkChipInput
              value={formData.technique}
              inputValue={techniqueInputValue}
              onInputChange={setTechniqueInputValue}
              onChange={onTechniqueChange}
              maxItems={maxArtworkTechniques}
              options={ARTWORK_TECHNIQUES}
              placeholder="Search techniques"
              disabled={disabled}
              error={techniqueError ?? errors.technique}
              onErrorChange={setTechniqueError}
            />
          </div>
        </div>

        {formData.type === ArtworkType.PHYSICAL && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="physicalHeight">Height (cm)</Label>
                <Input
                  id="physicalHeight"
                  name="physicalHeight"
                  type="number"
                  value={formData.physicalHeight}
                  onChange={onChange}
                  placeholder="120"
                  min={0}
                  step="0.01"
                  disabled={disabled}
                />
                <FieldError message={errors.physicalHeight} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="physicalWidth">Width (cm)</Label>
                <Input
                  id="physicalWidth"
                  name="physicalWidth"
                  type="number"
                  value={formData.physicalWidth}
                  onChange={onChange}
                  placeholder="80"
                  min={0}
                  step="0.01"
                  disabled={disabled}
                />
                <FieldError message={errors.physicalWidth} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="physicalDepth">Depth (cm)</Label>
                <Input
                  id="physicalDepth"
                  name="physicalDepth"
                  type="number"
                  value={formData.physicalDepth}
                  onChange={onChange}
                  placeholder="4"
                  min={0}
                  step="0.01"
                  disabled={disabled}
                />
                <FieldError message={errors.physicalDepth} />
              </div>
            </div>
          </div>
        )}

        {formData.type === ArtworkType.DIGITAL && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="digitalWidth">Width (px)</Label>
                <Input
                  id="digitalWidth"
                  name="digitalWidth"
                  type="number"
                  value={formData.digitalWidth}
                  onChange={onChange}
                  placeholder="1920"
                  min={0}
                  disabled={disabled}
                />
                <FieldError message={errors.digitalWidth} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="digitalHeight">Height (px)</Label>
                <Input
                  id="digitalHeight-input"
                  name="digitalHeight"
                  type="number"
                  value={formData.digitalHeight}
                  onChange={onChange}
                  placeholder="1080"
                  min={0}
                  disabled={disabled}
                />
                <FieldError message={errors.digitalHeight} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fileSize">File Size (MB)</Label>
                <Input
                  id="fileSize"
                  name="fileSize"
                  type="number"
                  value={formData.fileSize}
                  onChange={onChange}
                  placeholder="4,5"
                  min={0}
                  step="0.1"
                  disabled={disabled}
                />
                <FieldError message={errors.fileSize} />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1">
          {formData.type === ArtworkType.PHYSICAL && (
            <div className="space-y-1.5">
              <Label htmlFor="materials">Materials</Label>
              <Textarea
                id="materials"
                name="materials"
                value={formData.materials}
                rows={2}
                onChange={onChange}
                placeholder="Oil, acrylic, watercolor..."
                disabled={disabled}
              />
            </div>
          )}

          {formData.type === ArtworkType.DIGITAL && (
            <div className="space-y-1.5">
              <Label htmlFor="tools">Tools</Label>
              <Textarea
                id="tools"
                name="tools"
                value={formData.tools}
                rows={2}
                onChange={onChange}
                placeholder="Photoshop, Figma, Blender..."
                disabled={disabled}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
