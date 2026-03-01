import { useNavigate } from 'react-router-dom';
import { DropdownMenu, type DropdownMenuItem } from './ui/dropdown-menu';
import { CreateIcon } from './ui/icons/create-icon';
import { LuFolders, LuImage } from 'react-icons/lu';

const createDropdownMenuItems: (navigate: ReturnType<typeof useNavigate>) => DropdownMenuItem[] = (navigate) => [
  {
    id: 'artwork',
    icon: <LuImage className="text-muted-foreground" size={22} />,
    title: 'Artwork',
    description: 'Publish your digital or physical artwork to share it with others',
    onSelect: () => navigate('/artwork/create'),
  },
  {
    id: 'collection',
    icon: <LuFolders className="text-muted-foreground" size={22} />,
    title: 'Collection',
    description: 'Create a collection to organize and showcase your artworks',
    onSelect: () => navigate('/collection/create'),
  },
];

type CreateDropdownMenuProps = {
  createIconSize: number;
  placement: 'bottom' | 'top';
};

const title = 'Create';

export function CreateDropdownMenu({ createIconSize, placement }: CreateDropdownMenuProps) {
  const navigate = useNavigate();
  const items = createDropdownMenuItems(navigate);

  return (
    <DropdownMenu
      title={title}
      items={items}
      placement={placement}
      trigger={({ onToggle, open }) => <CreateIcon size={createIconSize} onClick={onToggle} isActive={open} />}
    />
  );
}
