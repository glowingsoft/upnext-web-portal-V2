import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';

import { useSelector } from 'react-redux';

import { normalizeImageUrl } from 'src/utils/normalize-image-url';

// ----------------------------------------------------------------------

export function ChatNavAccount() {
  const { user } = useSelector((state) => state.user);

  const name = user?.basicInfo?.name || '';
  const avatar = normalizeImageUrl(user?.basicInfo?.profileIcon);

  return (
    <Badge variant="online" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Avatar src={avatar} alt={name} sx={{ width: 40, height: 40 }}>
        {name?.charAt(0).toUpperCase()}
      </Avatar>
    </Badge>
  );
}
