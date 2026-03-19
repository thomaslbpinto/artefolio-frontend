import { LuSearch } from 'react-icons/lu';
import { IconButton } from './base/icon-button';
import type { IconButtonProps } from './base/icon-button';

type SearchIconProps = Omit<IconButtonProps, 'icon' | 'title'>;

const title = 'Search';

export function SearchIcon(props: SearchIconProps) {
  return <IconButton icon={LuSearch} title={title} aria-label={title} {...props} />;
}
