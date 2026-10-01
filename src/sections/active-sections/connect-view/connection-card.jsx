import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

export function ConnectionCard({ item, schedulingUrl, onSchedulingUrlChange, onViewPayoutMethod }) {
  const { t } = useTranslate();
  const isConnected = item.status === 'connected';
  const opensPayoutMethod = item.id === 'bank-account';
  const usePrimaryButton = opensPayoutMethod || item.primaryAction;

  return (
    <Box sx={{ p: 2.5, height: '100%' }} component={Card}>
      <Stack spacing={2}>
        <Stack direction="column" spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'grey.100',
                flexShrink: 0,
              }}
            >
              <Iconify icon={item.icon} width={25} />
            </Box>

            <Label sx={{ width: 'fitContent' }} color={isConnected ? 'success' : 'error'}>
              {isConnected ? t('connected') : t('notConnected')}
            </Label>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t(item.titleKey || item.title)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t(item.descriptionKey || item.description)}
            </Typography>
          </Box>
        </Stack>

        {item.id === 'calendly' && <TextField fullWidth placeholder={item.placeholder} value={schedulingUrl} onChange={(event) => onSchedulingUrlChange?.(event.target.value)} />}

        <Button
          fullWidth
          variant="contained"
          color={usePrimaryButton ? 'primary' : 'inherit'}
          onClick={opensPayoutMethod ? onViewPayoutMethod : undefined}
          sx={{
            height: 46,
            borderRadius: 1.5,
            ...(!usePrimaryButton && {
              bgcolor: 'grey.400',
              color: 'common.white',
              '&:hover': { bgcolor: 'grey.500' },
            }),
          }}
        >
          {t(item.buttonLabelKey || item.buttonLabel)}
        </Button>
      </Stack>
    </Box>
  );
}
