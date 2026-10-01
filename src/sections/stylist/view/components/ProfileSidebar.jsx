import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { textGradient } from 'src/theme/styles';
import { brand } from 'src/sections/home/landing/theme';
import SurfaceCard from 'src/sections/home/landing/SurfaceCard';

// ----------------------------------------------------------------------

export default function ProfileSidebar({ business, ratingBreakdown }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Rating */}
      <SurfaceCard sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
          <Iconify icon="mingcute:star-fill" width={16} sx={{ color: '#F59E0B' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, ...textGradient(`135deg, ${brand.green[400]} 0%, ${brand.green[900]} 100%`) }}>
            Rating
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mb: 0.75 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '2rem', color: 'text.primary', lineHeight: 1 }}>
            {Number(business.rating?.avgRating || 0).toFixed(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            / 5
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.25, mb: 0.5 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Iconify
              key={s}
              icon={s <= Math.round(business.rating?.avgRating || 0) ? 'mingcute:star-fill' : 'mingcute:star-line'}
              width={15}
              sx={{ color: s <= Math.round(business.rating?.avgRating || 0) ? '#F59E0B' : 'text.disabled' }}
            />
          ))}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Based on {business.rating?.totalReviews ?? 0} reviews
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
            '@keyframes barGrow': { from: { width: 0 }, to: { width: 'var(--bar-w)' } },
          }}
        >
          {ratingBreakdown.map((item, index) => (
            <Box key={item.star} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ width: 8, color: 'text.secondary', flexShrink: 0 }}>
                {item.star}
              </Typography>
              <Iconify icon="mingcute:star-fill" width={11} sx={{ color: '#F59E0B', flexShrink: 0 }} />
              <Box sx={{ flex: 1, height: 6, borderRadius: 6, bgcolor: alpha('#F59E0B', 0.18), overflow: 'hidden' }}>
                <Box
                  sx={{
                    '--bar-w': `${item.percent}%`,
                    width: 'var(--bar-w)',
                    height: '100%',
                    bgcolor: '#F59E0B',
                    animation: `barGrow ${260 + index * 100}ms ease-out`,
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ width: 16, textAlign: 'right', color: 'text.secondary', flexShrink: 0 }}>
                {item.count}
              </Typography>
            </Box>
          ))}
        </Box>
      </SurfaceCard>

      {/* Booking notes */}
      <SurfaceCard sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, ...textGradient(`135deg, ${brand.green[400]} 0%, ${brand.green[900]} 100%`) }}>
          Booking notes
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {(business.bookingNotes || []).map((note, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  mt: 0.55,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: brand.green[400],
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {note}
              </Typography>
            </Box>
          ))}
        </Box>
      </SurfaceCard>
    </Box>
  );
}
