import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';

export function RevenueMetricCard({ title, subtitle, value, change, trend = 'up', icon, valueColor = 'text.primary' }) {
  const badgeColor = trend === 'down' ? 'error' : trend === 'neutral' ? 'default' : 'success';
  const trendIcon = trend === 'up' ? 'eva:trending-up-fill' : trend === 'down' ? 'eva:trending-down-fill' : null;
  const isDefault = badgeColor === 'default';

  return (
    <Card
      sx={{
        p: 2,
        height: '100%',
        minHeight: 148,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: (theme) => theme.customShadows?.z8 ?? theme.shadows[4],
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'common.white',
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={22} />
        </Box>

        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderRadius: 10,
            typography: 'caption',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            color: isDefault ? 'text.secondary' : `${badgeColor}.dark`,
            bgcolor: isDefault
              ? (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.16)
              : (theme) => varAlpha(theme.vars.palette[badgeColor].mainChannel, 0.16),
          }}
        >
          {trendIcon && <Iconify icon={trendIcon} width={13} />}
          {change}
        </Box>
      </Box>

      <Stack spacing={0.75} sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            width: 'fit-content',
            px: 1,
            py: 0.35,
            borderRadius: 1,
            bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          }}
        >
          <Box sx={{ width: 5, height: 5, flexShrink: 0, borderRadius: '50%', bgcolor: 'text.disabled' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {subtitle}
          </Typography>
        </Box>
      </Stack>

      <Typography variant="h5" align="right" sx={{ fontWeight: 800, color: valueColor, mt: 1 }}>
        {value}
      </Typography>
    </Card>
  );
}

RevenueMetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  change: PropTypes.string.isRequired,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  icon: PropTypes.string.isRequired,
  valueColor: PropTypes.string,
};
