import { FiUser } from 'react-icons/fi';
import { IconButton } from './base/icon-button';
import type { IconButtonProps } from './base/icon-button';

type ProfileIconProps = Omit<IconButtonProps, 'icon' | 'onClick' | 'title'>;

const title = 'Profile';

export function ProfileIcon(props: ProfileIconProps) {
  return <IconButton icon={FiUser} onClick={openProfileOptions} title={title} aria-label={title} {...props} />;
}

function openProfileOptions() {
  // TODO: Implement open profile options
}
