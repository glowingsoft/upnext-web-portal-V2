import { useState } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';

import { PortfolioMediaTile } from './portfolio-media-tile';
import { ACCENT_SOFT, resolveMediaDisplay } from './portfolio-utils';

export function PortfolioCard({ item, canManage, onEdit, onRequestDelete, onView }) {
  const [hovered, setHovered] = useState(false);
  const display = resolveMediaDisplay(item.media?.[0]);

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onView(item)}
      onKeyDown={(event) => event.key === 'Enter' && onView(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? (theme) => `0 18px 40px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.14)}` : 'none',
      }}
    >
      {/* Media */}
      <Box sx={{ position: 'relative', width: '100%', pt: '75%', bgcolor: ACCENT_SOFT, flexShrink: 0 }}>
        <PortfolioMediaTile display={display} name={item.name} />

        {/* Bottom gradient scrim + name/business overlay */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            px: 2,
            pt: 4,
            pb: 1.5,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.62) 100%)',
          }}
        >
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.3 }} noWrap>
            {item.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }} noWrap>
            {item.businessName}
          </Typography>
        </Box>

        {/* Manage actions */}
        {canManage && (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(-4px)',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
          >
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(item);
              }}
              sx={{ bgcolor: 'rgba(0,0,0,0.45)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' } }}
            >
              <Iconify icon="solar:pen-bold" width={15} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onRequestDelete(item);
              }}
              sx={{ bgcolor: 'rgba(0,0,0,0.45)', color: '#fff', '&:hover': { bgcolor: 'error.main' } }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" width={15} />
            </IconButton>
          </Stack>
        )}
      </Box>

      {/* Description */}
      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.65,
            minHeight: 'calc(1.65em * 3)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.description}
        </Typography>
      </Box>
    </Box>
  );
}
