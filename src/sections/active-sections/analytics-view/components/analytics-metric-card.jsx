import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';

export function AnalyticsMetricCard({ label, value, change, trend, icon, compareLabel, color = 'primary', valueColor }) {
  const theme = useTheme();
  const isNeutral = trend === 'neutral';
  const trendColor = trend === 'down' ? 'error' : 'success';

  return (
    <Card sx={{ py: 2, px: { xs: 2, sm: 2.5 }, height: '100%', transition: theme.transitions.create(['transform', 'box-shadow'], { duration: 200 }), '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.customShadows.z16 } }}>
      <Box sx={{ pr: 4.5 }}>
        <Box sx={{ fontSize: { xs: '1.15rem', sm: '1.56rem' }, fontWeight: 700, lineHeight: 1.3, color: valueColor }}>{value}</Box>

        <Typography component="div" sx={{ color: 'text.secondary', fontSize: '0.8125rem', py: 0.2 }}>
          {label}
        </Typography>
      </Box>

      <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ mt: 0.9, columnGap: 0.75, rowGap: 0.25, minHeight: 24 }}>
        {change ? (
          <>
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.35,
                display: 'inline-flex',
                borderRadius: 0.8,
                typography: 'caption',
                fontSize: '0.75rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                color: isNeutral ? 'text.secondary' : theme.vars.palette[trendColor].dark,
                bgcolor: isNeutral ? varAlpha(theme.vars.palette.grey['500Channel'], 0.16) : varAlpha(theme.vars.palette[trendColor].mainChannel, 0.16),
              }}
            >
              {change}
            </Box>

            {compareLabel && (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {compareLabel}
              </Typography>
            )}
          </>
        ) : (
          compareLabel && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              –
            </Typography>
          )
        )}
      </Stack>

      <Iconify
        icon={icon}
        width={28}
        sx={{ top: { xs: 18, sm: 24 }, right: { xs: 12, sm: 20 }, position: 'absolute', color: theme.vars.palette[color].main }}
      />

      <Box
        sx={{
          top: -44,
          width: 160,
          zIndex: -1,
          height: 160,
          right: -110,
          opacity: 0.12,
          borderRadius: 3,
          position: 'absolute',
          transform: 'rotate(40deg)',
          background: `linear-gradient(to right, ${theme.vars.palette[color].main} 0%, ${varAlpha(theme.vars.palette[color].mainChannel, 0)} 100%)`,
        }}
      />
    </Card>
  );
}

AnalyticsMetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  change: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']).isRequired,
  icon: PropTypes.string.isRequired,
  compareLabel: PropTypes.string,
  color: PropTypes.string,
  valueColor: PropTypes.string,
};
