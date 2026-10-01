import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';

export function AnalyticsMetricCard({ label, value, change, trend, icon }) {
  const isUp = trend === 'up';

  return (
    <Card
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows?.z8 ?? theme.shadows[4],
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
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
              px: 1,
              py: 0.35,
              borderRadius: 10,
              typography: 'caption',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              color: isUp ? 'success.dark' : 'error.dark',
              bgcolor: (theme) =>
                varAlpha(isUp ? theme.vars.palette.success.mainChannel : theme.vars.palette.error.mainChannel, 0.16),
            }}
          >
            {change}
          </Box>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.25 }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

AnalyticsMetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  change: PropTypes.string.isRequired,
  trend: PropTypes.oneOf(['up', 'down']).isRequired,
  icon: PropTypes.string.isRequired,
};
