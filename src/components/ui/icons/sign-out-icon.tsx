import { FiLogOut } from 'react-icons/fi';
import { IconButton } from './base/icon-button';
import type { IconButtonProps } from './base/icon-button';
import { useAuth } from '@/contexts/auth.context';
import { useNavigate } from 'react-router-dom';

type SignOutIconProps = Omit<IconButtonProps, 'icon' | 'onClick' | 'title'>;

const title = 'Sign out';

export function SignOutIcon(props: SignOutIconProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  return <IconButton icon={FiLogOut} onClick={handleSignOut} title={title} aria-label={title} {...props} />;
}
