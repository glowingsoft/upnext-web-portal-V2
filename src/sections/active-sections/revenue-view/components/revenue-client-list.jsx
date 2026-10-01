import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

import { useTranslate } from 'src/locales/use-locales';

export function RevenueClientList({ clients = [] }) {
  const { t } = useTranslate();
  if (!clients.length) {
    return (
      <Card sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body2" color="text.disabled" align="center">
          {t('noClientsFound')}
        </Typography>
      </Card>
    );
  }

  return (
    <Stack spacing={1.5}>
      {clients.map((client) => (
        <Card
          key={client.id}
          sx={{
            px: 2,
            py: 1.75,
            borderRadius: 2,
            boxShadow: (theme) => theme.customShadows?.z8 ?? theme.shadows[2],
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              src={client.avatar}
              alt={client.name}
              sx={{
                width: 48,
                height: 48,
                bgcolor: client.avatarColor || 'primary.main',
                fontWeight: 700,
              }}
            >
              {client.initials}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                {client.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                {client.lastService}
              </Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>
              {client.amount}
            </Typography>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

RevenueClientList.propTypes = {
  clients: PropTypes.array,
};
