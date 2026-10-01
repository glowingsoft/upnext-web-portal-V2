import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

import { ConnectionCard } from './connection-card';

// ----------------------------------------------------------------------

const CONNECT_CARD_MAX_WIDTH = 360;

export function ConnectConnectionsView({
  connections,
  isCustomer,
  isProvider = false,
  connectSearchValue,
  onConnectSearchChange,
  schedulingUrl,
  onSchedulingUrlChange,
  onViewPayoutMethod,
}) {
  const { t } = useTranslate();
  const trimmedSearch = connectSearchValue.trim();
  const hasResults = connections.length > 0;
  const showSearch = isCustomer || isProvider;

  const cardColumn = `minmax(0, ${CONNECT_CARD_MAX_WIDTH}px)`;

  const gridTemplateColumns = {
    xs: `repeat(1, ${cardColumn})`,
    md: isCustomer ? `repeat(1, ${cardColumn})` : isProvider ? `repeat(2, ${cardColumn})` : 'repeat(3, 1fr)',
  };

  return (
    <>
      {showSearch && (
        <TextField
          fullWidth
          value={connectSearchValue}
          onChange={(event) => onConnectSearchChange(event.target.value)}
          placeholder={t('searchHere')}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      )}

      {hasResults ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns,
            gap: 3,
          }}
        >
          {connections.map((item) => (
            <ConnectionCard key={item.id} item={item} schedulingUrl={schedulingUrl} onSchedulingUrlChange={onSchedulingUrlChange} onViewPayoutMethod={onViewPayoutMethod} />
          ))}
        </Box>
      ) : (
        <Card
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            bgcolor: 'common.white',
          }}
        >
          <Stack spacing={2.5} alignItems="center" textAlign="center" sx={{ maxWidth: 560, mx: 'auto' }}>
            <Box
              sx={{
                width: 86,
                height: 86,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: (theme) => `linear-gradient(135deg, ${theme.palette.warning.light}, ${theme.palette.primary.light})`,
                boxShadow: (theme) => `0 14px 28px ${theme.palette.primary.main}33`,
              }}
            >
              <Iconify icon="solar:magnifer-zoom-out-bold" width={44} sx={{ color: 'common.white' }} />
            </Box>

            <Stack spacing={1}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {t('noConnectFound')}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {trimmedSearch ? t('noConnectionMatching', { search: trimmedSearch }) : t('noConnectionOptions')}
              </Typography>
            </Stack>

            <Button variant="contained" onClick={() => onConnectSearchChange('')} startIcon={<Iconify icon="solar:restart-bold" />}>
              {t('clearSearch')}
            </Button>
          </Stack>
        </Card>
      )}
    </>
  );
}
