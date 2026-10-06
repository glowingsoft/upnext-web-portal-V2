import { Box, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { PortfolioMediaTile } from 'src/sections/active-sections/provider-detail-view/components/portfolio/portfolio-media-tile';
import { resolveMediaDisplay } from 'src/sections/active-sections/provider-detail-view/components/portfolio/portfolio-utils';

import { brand } from './theme';
import { previewArrowSx, previewBadgeSx, previewCardSx, previewFooterSx, previewLinkSx } from './previewCardStyles';

// ----------------------------------------------------------------------

const KIND_LABELS = { image: 'Photo', video: 'Video', pdf: 'Document' };

export default function PortfolioPreviewCard({ item, onView }) {
  const display = resolveMediaDisplay(item.media?.[0]);
  const businessName = item.businessName ?? item.business?.businessName;
  const handleView = () => onView?.({ ...item, businessName });

  return (
    <Box
      onClick={handleView}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleView();
        }
      }}
      sx={{ ...previewCardSx, '&:hover .portfolio-preview-media img': { transform: 'scale(1.05)' } }}
    >
      <Box
        className="portfolio-preview-media"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          aspectRatio: '16 / 10',
          bgcolor: brand.green[100],
          '& img': { transition: 'transform 0.5s ease' },
        }}
      >
        <PortfolioMediaTile display={display} name={item.name} />

        <Box sx={{ ...previewBadgeSx, left: 12 }}>
          <Iconify icon="solar:gallery-wide-bold" width={12} sx={{ color: brand.green[600] }} />
          {KIND_LABELS[display?.kind] || 'Portfolio'}
        </Box>
      </Box>

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" noWrap sx={{ mb: 0.5, fontWeight: 700, fontSize: { xs: '1.15rem', sm: '1.15rem', md: '1.15rem', lg: '1.2rem' }, lineHeight: 1.3 }}>
          {item.name}
        </Typography>

        {businessName && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, minWidth: 0 }}>
            <Iconify icon="mingcute:store-2-line" width={14} sx={{ color: brand.green[400], flexShrink: 0 }} />
            <Typography noWrap sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              {businessName}
            </Typography>
          </Box>
        )}

        <Typography
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1.25,
            fontSize: '0.82rem',
            lineHeight: 1.55,
            color: 'text.secondary',
          }}
        >
          {item.description}
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ ...previewFooterSx, justifyContent: 'flex-end' }}>
          <Box
            component="button"
            type="button"
            aria-label={`View ${item.name}`}
            onClick={(event) => {
              event.stopPropagation();
              handleView();
            }}
            sx={previewLinkSx}
          >
            View Work
            <Box className="preview-card-arrow" sx={previewArrowSx}>
              <Iconify icon="mingcute:arrow-right-line" width={16} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
