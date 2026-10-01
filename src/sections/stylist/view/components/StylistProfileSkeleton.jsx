import { Box, Grid, Skeleton } from '@mui/material';

import SurfaceCard from 'src/sections/home/landing/SurfaceCard';

const PAGE_BACKGROUND = 'linear-gradient(180deg, #F3EADC 0%, #FDFBF7 44%, #ffffff 100%)';

// ----------------------------------------------------------------------

export default function StylistProfileSkeleton() {
  return (
    <Box sx={{ background: PAGE_BACKGROUND, minHeight: '100vh' }}>
      <Box sx={{ pt: { xs: 9, md: 11 }, pb: 6, px: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Skeleton variant="text" width={70} height={32} sx={{ mb: 2.5 }} />

        {/* Header card */}
        <SurfaceCard sx={{ mb: 3, overflow: 'hidden' }}>
          <Skeleton variant="rectangular" height={190} sx={{ transform: 'none' }} />
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 2, md: 3 } }}>
              <Skeleton variant="circular" width={88} height={88} sx={{ flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
                <Skeleton variant="text" width="45%" height={34} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Skeleton variant="rounded" width={90} height={24} />
                  <Skeleton variant="rounded" width={90} height={24} />
                  <Skeleton variant="rounded" width={110} height={24} />
                </Box>
              </Box>
            </Box>
          </Box>
        </SurfaceCard>

        <Grid container spacing={3} alignItems="flex-start">
          {/* Services */}
          <Grid item xs={12} md={8}>
            <SurfaceCard sx={{ p: 3 }}>
              <Skeleton variant="text" width={120} height={28} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width={220} height={18} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
                <Skeleton variant="rounded" width={64} height={30} sx={{ borderRadius: 99 }} />
                <Skeleton variant="rounded" width={90} height={30} sx={{ borderRadius: 99 }} />
                <Skeleton variant="rounded" width={78} height={30} sx={{ borderRadius: 99 }} />
              </Box>
              {[1, 2, 3, 4].map((row) => (
                <Box key={row} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: (t) => (row < 4 ? `1px solid ${t.palette.divider}` : 'none') }}>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="35%" height={22} sx={{ mb: 0.75 }} />
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      <Skeleton variant="rounded" width={70} height={20} />
                      <Skeleton variant="rounded" width={80} height={20} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" width={40} height={26} />
                </Box>
              ))}
            </SurfaceCard>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <SurfaceCard sx={{ p: 2.5 }}>
                <Skeleton variant="text" width={70} height={22} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width={80} height={44} sx={{ mb: 1 }} />
                {[5, 4, 3, 2, 1].map((star) => (
                  <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                    <Skeleton variant="text" width={8} height={16} />
                    <Skeleton variant="rounded" width="100%" height={6} sx={{ borderRadius: 6 }} />
                  </Box>
                ))}
              </SurfaceCard>

              <SurfaceCard sx={{ p: 2.5 }}>
                <Skeleton variant="text" width={110} height={22} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width="95%" height={18} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="85%" height={18} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={18} />
              </SurfaceCard>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
