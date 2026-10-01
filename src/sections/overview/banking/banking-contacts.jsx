import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export function BankingContacts({ title, subheader, path, list, onItemClick, ...other }) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(path || '/dashboard/clients');
  };

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Button size="small" onClick={handleNavigate} color="inherit" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}>
            View all
          </Button>
        }
      />

      <Scrollbar sx={{ minHeight: 364 }}>
        <Box
          sx={{
            p: 3,
            gap: 3,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 360,
          }}
        >
          {list.map((item) => (
            <Item key={item.id} item={item} onItemClick={onItemClick} />
          ))}
        </Box>
      </Scrollbar>
    </Card>
  );
}

function Item({ item, sx, onItemClick, ...other }) {
  const handleItemClick = () => {
    // No customer-details page exists for the business/provider dashboard (the backend
    // doesn't authorize that role for it) — only navigate if a caller supplies its own handler.
    onItemClick?.(item);
  };

  return (
    <Box key={item.id} sx={{ gap: 2, display: 'flex', alignItems: 'center', ...sx }} {...other}>
      <Avatar src={item.avatarUrl} />

      <ListItemText primary={item.name} secondary={item.email} />

      <Tooltip title="View Profile" placement="top">
        <IconButton onClick={handleItemClick}>
          <Iconify icon="solar:user-bold-duotone" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
