import { Label } from '@/components/ui/label';
import { ArtworkChipInput } from '@/components/artwork/artwork-chip-input';

type ArtworkTagsInputProps = {
  value: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onChange: (tags: string[]) => void;
  maxTags: number;
  maxTagLength: number;
  error?: string;
  disabled?: boolean;
  onErrorChange?: (message?: string) => void;
};

export function ArtworkTagsInput({
  value,
  inputValue,
  onInputChange,
  onChange,
  maxTags,
  maxTagLength,
  error,
  disabled,
  onErrorChange,
}: ArtworkTagsInputProps) {
  function validateTag(tag: string): string | undefined {
    const hashtagRegex = /^[\p{L}0-9_]+$/u;
    if (!hashtagRegex.test(tag)) {
      return 'Tags can only contain letters, numbers, and underscores, with no spaces or symbols';
    }

    return undefined;
  }

  return (
    <div className="space-y-1.5">
      <Label>Tags</Label>
      <ArtworkChipInput
        value={value}
        inputValue={inputValue}
        onInputChange={onInputChange}
        onChange={onChange}
        maxItems={maxTags}
        maxItemLength={maxTagLength}
        placeholder="Type a tag, then press comma or Enter"
        disabled={disabled}
        error={error}
        onErrorChange={onErrorChange}
        validateValue={validateTag}
      />
    </div>
  );
}
