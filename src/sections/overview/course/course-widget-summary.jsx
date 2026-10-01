import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fNumber } from 'src/utils/format-number';

import { varAlpha } from 'src/theme/styles';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

export function CourseWidgetSummary({ sx, icon, title, total, currency, color = 'warning', helperText, helperColor, ...other }) {
  const theme = useTheme();

  return (
    <Card sx={{ py: 2, pl: 2.5, pr: 2.5, ...sx }} {...other}>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ fontSize: '1.56rem', fontWeight: 700 }}>{currency ? `${currency} ${fNumber(total)}` : fNumber(total)}</Box>

        <Typography noWrap component="div" sx={{ color: 'text.secondary', fontSize: '0.8125rem', py: 0.2, pb: !helperText ? 2.5 : 0 }}>
          {title}
        </Typography>

        {helperText && (
          <Box
            component="span"
            sx={{
              mt: 0.9,
              px: 1,
              py: 0.35,
              display: 'inline-flex',
              borderRadius: 0.8,
              typography: 'caption',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: theme.vars.palette[helperColor || color].dark,
              bgcolor: varAlpha(theme.vars.palette[helperColor || color].mainChannel, 0.16),
            }}
          >
            {helperText}
          </Box>
        )}
      </Box>

      <SvgColor
        src={icon}
        sx={{
          top: 24,
          right: 20,
          width: 30,
          height: 30,
          position: 'absolute',
          background: `linear-gradient(135deg, ${theme.vars.palette[color].main} 0%, ${theme.vars.palette[color].dark} 100%)`,
        }}
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
