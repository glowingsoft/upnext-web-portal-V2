import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';

import { ACCENT, ACCENT_SOFT } from './portfolio-utils';

export function PortfolioAddTile({ onAdd }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onAdd}
      onKeyDown={(event) => event.key === 'Enter' && onAdd()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        width: '100%',
        pt: '75%',
        position: 'relative',
        border: '1.5px dashed',
        borderColor: hovered ? ACCENT : (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.32),
        bgcolor: hovered ? ACCENT_SOFT : 'transparent',
        transition: 'all 0.2s ease',
      }}
    >
      <Stack spacing={1} alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: hovered ? ACCENT : varAlpha('183 154 115', 0.14),
            color: hovered ? '#fff' : ACCENT,
            transition: 'all 0.2s ease',
          }}
        >
          <Iconify icon="mingcute:add-fill" width={22} />
        </Box>
        <Typography variant="subtitle2" sx={{ color: hovered ? ACCENT : 'text.secondary', fontWeight: 700 }}>
          Add Portfolio Item
        </Typography>
      </Stack>
    </Box>
  );
}
