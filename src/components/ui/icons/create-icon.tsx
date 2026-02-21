import { FiPlusSquare } from 'react-icons/fi';
import { IconButton } from './base/icon-button';
import type { IconButtonProps } from './base/icon-button';

type CreateIconProps = Omit<IconButtonProps, 'icon' | 'title'> & {
  onClick?: () => void;
  isActive?: boolean;
};

const title = 'Create';

export function CreateIcon({ onClick, isActive, ...props }: CreateIconProps) {
  return (
    <IconButton icon={FiPlusSquare} title={title} aria-label={title} onClick={onClick} isActive={isActive} {...props} />
  );
}
