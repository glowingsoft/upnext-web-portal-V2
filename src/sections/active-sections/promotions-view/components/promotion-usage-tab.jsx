import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { memo, useMemo } from 'react';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

const DETAIL_CREAM = '#fff3d8';
const DETAIL_CREAM_LIGHT = '#fff8e8';
const DETAIL_ACCENT = '#b79a73';
const DETAIL_ACCENT_LIGHT = '#efe7dc';

function StatBlock({ label, value, icon, hint }) {
  return (
    <Card
      sx={{
        p: 2.5,
        height: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
        bgcolor: DETAIL_CREAM_LIGHT,
        transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          bgcolor: DETAIL_CREAM,
          borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.22),
          boxShadow: (theme) => `0 12px 26px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.7),
            border: '1px solid',
            borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.14),
            boxShadow: (theme) => `0 10px 18px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.06)}`,
          }}
        >
          <Iconify icon={icon} width={22} sx={{ color: DETAIL_ACCENT }} />
        </Box>
        <Box>
          <Typography variant="overline" sx={{ color: DETAIL_ACCENT, letterSpacing: 1.4, lineHeight: 1.1 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.2, mt: 0.5 }}>
            {value}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {hint}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  );
}


export const RedemptionProgressCard = memo(({ promotion }) => {
  const { t } = useTranslate();
  const limit = promotion.usageLimit ?? 0;
  const used = promotion.redemptionsUsed ?? 0;
  const progress = useMemo(() => {
    if (!limit || limit <= 0) return 0;
    return Math.min(100, (used / limit) * 100);
  }, [limit, used]);

  const remaining = promotion.redemptionsRemaining ?? Math.max(0, limit - used);

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
        bgcolor: 'background.paper',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
        '&:hover': {
          borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.22),
          boxShadow: (theme) => `0 12px 26px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: DETAIL_CREAM,
                border: '1px solid',
                borderColor: DETAIL_ACCENT_LIGHT,
              }}
            >
              <Iconify icon="solar:pie-chart-2-bold" width={18} sx={{ color: DETAIL_ACCENT }} />
            </Box>
            <Typography variant="subtitle2" fontWeight={800}>
              {t('redemptionProgress')}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {limit ? `${used} / ${limit}` : t('usedCount', { count: used })}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 99,
            bgcolor: DETAIL_ACCENT_LIGHT,
            '& .MuiLinearProgress-bar': {
              borderRadius: 99,
              bgcolor: DETAIL_ACCENT,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {limit ? t('redemptionsRemainingBeforeCap', { count: remaining }) : t('noUsageCapConfigured')}
        </Typography>
      </Stack>
    </Card>
  );
});

export const PromotionUsageSection = memo(({ promotion }) => {
  const { t } = useTranslate();
  const limit = promotion.usageLimit ?? 0;
  const used = promotion.redemptionsUsed ?? 0;
  const remaining = promotion.redemptionsRemaining ?? Math.max(0, limit - used);

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:chart-2-bold" width={20} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={800}>
            {t('usageAndLimits')}
          </Typography>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        <StatBlock label={t('redemptionsUsed')} value={used} icon="solar:chart-2-bold" hint={t('timesPromotionApplied')} />
        <StatBlock label={t('totalUsageCap')} value={limit || t('notAvailable')} icon="solar:shield-user-bold" hint={t('maximumRedemptionsAllowed')} />
        <StatBlock label={t('perUserLimit')} value={promotion.perUserLimit ?? t('notAvailable')} icon="solar:user-bold" hint={t('redemptionsPerCustomer')} />
        <StatBlock label={t('redemptionsRemaining')} value={limit ? remaining : t('notAvailable')} icon="solar:flag-bold" hint={t('redemptionsAvailableBeforeCap')} />
      </Box>
    </Stack>
  );
});

export const PromotionUsageTab = memo(({ promotion }) => (
  <Box sx={{ p: 3 }}>
    <PromotionUsageSection promotion={promotion} />
  </Box>
));
