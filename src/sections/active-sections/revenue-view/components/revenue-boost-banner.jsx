import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

const boostCardSx = {
  borderRadius: 2.5,
  overflow: 'hidden',
  border: (theme) => `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.22)}`,
  bgcolor: (theme) => theme.vars.palette.common.white,
  backgroundImage: (theme) =>
    `linear-gradient(
      128deg,
      ${varAlpha(theme.vars.palette.primary.mainChannel, 0.12)} 0%,
      ${theme.vars.palette.common.white} 36%,
      ${theme.vars.palette.common.white} 58%,
      ${varAlpha(theme.vars.palette.primary.mainChannel, 0.08)} 100%
    )`,
  boxShadow: (theme) => `0 8px 24px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.06)}`,
};

export function RevenueBoostBanner({ onLearnMore }) {
  const { t } = useTranslate();
  return (
    <Card
      sx={{
        ...boostCardSx,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
            {t('boostYourVisibility')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 1.5, pr: { xs: 0, sm: 6 } }}>
            {t('boostVisibilityDescription')}
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            onClick={onLearnMore}
            sx={{ cursor: 'pointer', width: 'fit-content' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {t('learnMore')}
            </Typography>
            <IconButton
              size="small"
              onClick={onLearnMore}
              sx={{
                bgcolor: 'primary.main',
                color: 'common.white',
                width: 32,
                height: 32,
                boxShadow: (theme) => `0 4px 12px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.28)}`,
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <Iconify icon="eva:arrow-forward-fill" width={18} />
            </IconButton>
          </Stack>
        </Box>

        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: 'common.white',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            boxShadow: (theme) => `0 6px 16px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.24)}`,
          }}
        >
          <Iconify icon="solar:rocket-bold" width={28} />
        </Box>
      </Stack>
    </Card>
  );
}

RevenueBoostBanner.propTypes = {
  onLearnMore: PropTypes.func,
};
