import { Box, Grid, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { brand } from 'src/sections/home/landing/theme';
import SurfaceCard from 'src/sections/home/landing/SurfaceCard';

const PAGE_BACKGROUND = 'linear-gradient(180deg, #F3EADC 0%, #FDFBF7 44%, #ffffff 100%)';

const cardSx = {
  borderRadius: 3,
  border: `1px solid ${alpha(brand.green[400], 0.2)}`,
};

const hairline = `1px solid ${alpha(brand.green[400], 0.18)}`;

// ----------------------------------------------------------------------

export default function StylistProfileSkeleton() {
  return (
    <Box sx={{ background: PAGE_BACKGROUND, minHeight: '100vh' }}>
      <Box sx={{ pt: { xs: 9, md: 11 }, pb: 6, px: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Skeleton variant="text" width={70} height={32} sx={{ mb: 2.5 }} />

        <SurfaceCard sx={{ ...cardSx, mb: 3, overflow: 'hidden' }}>
          <Skeleton variant="rectangular" sx={{ transform: 'none', height: { xs: 150, md: 220 } }} />

          <Box sx={{ px: { xs: 2.5, md: 4 }, pb: { xs: 2.5, md: 3.5 } }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start', gap: { xs: 1.5, sm: 2.5 } }}>
              <Skeleton
                variant="circular"
                sx={{
                  flexShrink: 0,
                  mt: { xs: -5, md: -6 },
                  width: { xs: 88, md: 112 },
                  height: { xs: 88, md: 112 },
                  border: 'solid 4px #fff',
                  bgcolor: 'grey.300',
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0, width: 1, pt: { sm: 2 } }}>
                <Skeleton variant="text" height={38} sx={{ mb: 0.5, width: { xs: '70%', sm: '40%' } }} />
                <Skeleton variant="text" height={20} sx={{ width: { xs: '90%', sm: '55%' } }} />
              </Box>
            </Box>

            <Box sx={{ mt: 2.5, maxWidth: 880 }}>
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="96%" height={20} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>

            <Box sx={{ display: 'flex', gap: 0.75, mt: 2 }}>
              <Skeleton variant="rounded" width={84} height={24} sx={{ borderRadius: 99 }} />
              <Skeleton variant="rounded" width={96} height={24} sx={{ borderRadius: 99 }} />
              <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: 99 }} />
            </Box>
          </Box>
        </SurfaceCard>

        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={8}>
            <SurfaceCard sx={{ ...cardSx, overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: hairline }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
                  {[130, 160, 150, 120].map((width, index) => (
                    <Skeleton key={index} variant="rounded" width={width} height={62} sx={{ borderRadius: 2 }} />
                  ))}
                </Box>
                <Skeleton variant="text" width={90} height={16} sx={{ mb: 1 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {[70, 78, 76, 68, 96].map((width, index) => (
                    <Skeleton key={index} variant="rounded" width={width} height={26} sx={{ borderRadius: 99 }} />
                  ))}
                </Box>
              </Box>

              <Box sx={{ px: 3, pt: 3, pb: 2.5, borderBottom: hairline }}>
                <Skeleton variant="text" width={140} height={40} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" height={20} sx={{ mb: 2.5, width: { xs: '90%', sm: 320 } }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[62, 84, 150, 70].map((width, index) => (
                    <Skeleton key={index} variant="rounded" width={width} height={34} sx={{ borderRadius: 99 }} />
                  ))}
                </Box>
              </Box>

              <Box sx={{ px: 3 }}>
                {[1, 2, 3, 4].map((row) => (
                  <Box
                    key={row}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      py: 2.5,
                      borderBottom: row < 4 ? hairline : 'none',
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Skeleton variant="text" width="38%" height={24} sx={{ mb: 1 }} />
                      <Skeleton variant="rounded" width={72} height={24} sx={{ borderRadius: 99 }} />
                    </Box>
                    <Skeleton variant="text" width={52} height={28} />
                    <Skeleton variant="circular" width={34} height={34} />
                  </Box>
                ))}
              </Box>
            </SurfaceCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
              <SurfaceCard sx={{ ...cardSx, p: { xs: 2.5, md: 3 } }}>
                <Skeleton variant="text" width={90} height={32} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                  <Skeleton variant="circular" width={48} height={48} sx={{ flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={22} />
                    <Skeleton variant="text" width="45%" height={18} />
                  </Box>
                </Box>
              </SurfaceCard>

              <SurfaceCard sx={{ ...cardSx, p: { xs: 2.5, md: 3 } }}>
                <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="95%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="85%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={20} />
              </SurfaceCard>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
