import { LuHouse } from 'react-icons/lu';
import { IconLink } from './base/icon-link';
import type { IconLinkProps } from './base/icon-link';

type HomeIconProps = Omit<IconLinkProps, 'icon' | 'to' | 'title'>;

const title = 'Go to home';

export function HomeIcon(props: HomeIconProps) {
  return <IconLink icon={LuHouse} to="/" title={title} aria-label={title} {...props} />;
}
