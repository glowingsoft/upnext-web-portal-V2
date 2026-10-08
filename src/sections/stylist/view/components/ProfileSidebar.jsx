import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { brand } from 'src/sections/home/landing/theme';
import SurfaceCard from 'src/sections/home/landing/SurfaceCard';

// ----------------------------------------------------------------------

const cardSx = {
  p: { xs: 2.5, md: 3 },
  borderRadius: 3,
  border: `1px solid ${alpha(brand.green[400], 0.2)}`,
};

const headingSx = {
  fontWeight: 700,
  fontSize: { xs: '1.25rem', sm: '1.25rem', md: '1.3rem', lg: '1.3rem' },
};

export default function ProfileSidebar({ business, ratingBreakdown }) {
  const avgRating = Number(business.rating?.avgRating || 0);
  const totalReviews = business.rating?.totalReviews ?? 0;
  const hasReviews = totalReviews > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
      <SurfaceCard sx={cardSx}>
        <Typography variant="h4" sx={{ ...headingSx, mb: 2 }}>
          Rating
        </Typography>

        {hasReviews ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mb: 0.75 }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1,
                  color: 'text.primary',
                  fontVariantNumeric: 'lining-nums',
                  fontSize: { xs: '2.5rem', sm: '2.5rem', md: '2.5rem', lg: '2.75rem' },
                }}
              >
                {avgRating.toFixed(1)}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>/ 5</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.25, mb: 0.75 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Iconify
                  key={star}
                  icon={star <= Math.round(avgRating) ? 'mingcute:star-fill' : 'mingcute:star-line'}
                  width={17}
                  sx={{ color: star <= Math.round(avgRating) ? '#F59E0B' : 'text.disabled' }}
                />
              ))}
            </Box>

            <Typography sx={{ mb: 2.5, fontSize: '0.85rem', color: 'text.secondary' }}>
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </Typography>

            <Box
              sx={{
                pt: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                borderTop: `1px solid ${alpha(brand.green[400], 0.18)}`,
                '@keyframes barGrow': { from: { width: 0 }, to: { width: 'var(--bar-w)' } },
              }}
            >
              {ratingBreakdown.map((item, index) => (
                <Box key={item.star} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ width: 8, flexShrink: 0, fontSize: '0.8rem', color: 'text.secondary' }}>{item.star}</Typography>
                  <Iconify icon="mingcute:star-fill" width={12} sx={{ color: '#F59E0B', flexShrink: 0 }} />
                  <Box sx={{ flex: 1, height: 6, borderRadius: 6, bgcolor: alpha(brand.green[400], 0.16), overflow: 'hidden' }}>
                    <Box
                      sx={{
                        '--bar-w': `${item.percent}%`,
                        width: 'var(--bar-w)',
                        height: '100%',
                        borderRadius: 6,
                        bgcolor: brand.green[400],
                        animation: `barGrow ${260 + index * 100}ms ease-out`,
                      }}
                    />
                  </Box>
                  <Typography sx={{ width: 20, flexShrink: 0, textAlign: 'right', fontSize: '0.8rem', color: 'text.secondary' }}>
                    {item.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: brand.green[600],
                bgcolor: alpha(brand.green[400], 0.12),
                border: `1px solid ${alpha(brand.green[400], 0.25)}`,
              }}
            >
              <Iconify icon="mingcute:star-line" width={22} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.4 }}>New on UpNext</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', lineHeight: 1.5 }}>No reviews yet.</Typography>
            </Box>
          </Box>
        )}
      </SurfaceCard>

      {business.bookingNotes?.length > 0 && (
        <SurfaceCard sx={cardSx}>
          <Typography variant="h4" sx={{ ...headingSx, mb: 2 }}>
            Booking notes
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {business.bookingNotes.map((note, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                <Iconify icon="mingcute:check-line" width={16} sx={{ mt: 0.4, flexShrink: 0, color: brand.green[400] }} />
                <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', lineHeight: 1.7 }}>{note}</Typography>
              </Box>
            ))}
          </Box>
        </SurfaceCard>
      )}
    </Box>
  );
}
