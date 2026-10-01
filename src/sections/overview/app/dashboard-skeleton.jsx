import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';

// ----------------------------------------------------------------------

function SummaryTileSkeleton() {
  return (
    <Card sx={{ py: 2, pl: 2.5, pr: 2.5 }}>
      <Skeleton variant="text" sx={{ width: 72, height: 36, transform: 'none' }} />
      <Skeleton variant="text" sx={{ width: 120, height: 20, mb: 1, transform: 'none' }} />
      <Skeleton variant="rounded" sx={{ width: 96, height: 24, borderRadius: 0.8 }} />
    </Card>
  );
}

function CardSkeleton({ height = 200, sx }) {
  return (
    <Card sx={{ p: 3, height, width: 1, display: 'flex', flexDirection: 'column', ...sx }}>
      <Skeleton variant="text" sx={{ width: 140, height: 28, mb: 2, transform: 'none' }} />
      <Skeleton variant="rounded" sx={{ flex: 1, borderRadius: 2 }} />
    </Card>
  );
}

function FinanceStatCardSkeleton() {
  return (
    <Box sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.75 }}>
      <Skeleton variant="rounded" sx={{ width: 44, height: 44, borderRadius: 1.5, flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton variant="text" sx={{ width: 70, height: 28, transform: 'none' }} />
        <Skeleton variant="text" sx={{ width: 100, height: 18, transform: 'none' }} />
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function ProviderDashboardSkeleton() {
  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={12}>
        <Box sx={{ gap: 3, display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(4, 1fr)' } }}>
          {[...Array(8)].map((_, index) => (
            <SummaryTileSkeleton key={index} />
          ))}
        </Box>
      </Grid>

      <Grid xs={12} md={6} lg={4} sx={{ display: 'flex' }}>
        <CardSkeleton height={420} sx={{ flex: 1 }} />
      </Grid>

      <Grid xs={12} md={6} lg={8} sx={{ display: 'flex' }}>
        <CardSkeleton height={420} sx={{ flex: 1 }} />
      </Grid>

      <Grid xs={12}>
        <Box sx={{ gap: 3, display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
          {[...Array(4)].map((_, index) => (
            <FinanceStatCardSkeleton key={index} />
          ))}
        </Box>
      </Grid>

      <Grid xs={12} md={6} lg={4} sx={{ display: 'flex' }}>
        <CardSkeleton height={360} sx={{ flex: 1 }} />
      </Grid>

      <Grid xs={12} md={6} lg={4}>
        <CardSkeleton height={360} />
      </Grid>

      <Grid xs={12} md={5} lg={4}>
        <CardSkeleton height={360} />
      </Grid>
    </Grid>
  );
}

// ----------------------------------------------------------------------

export function AdminDashboardSkeleton() {
  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={12}>
        <Box sx={{ gap: 3, display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(4, 1fr)' } }}>
          {[...Array(8)].map((_, index) => (
            <SummaryTileSkeleton key={index} />
          ))}
        </Box>
      </Grid>

      <Grid xs={12} md={12} lg={8} sx={{ display: 'flex' }}>
        <CardSkeleton height={400} sx={{ flex: 1 }} />
      </Grid>

      <Grid xs={12} md={12} lg={4} sx={{ display: 'flex' }}>
        <CardSkeleton height={400} sx={{ flex: 1 }} />
      </Grid>

      <Grid xs={12} md={12} lg={4} sx={{ display: 'flex' }}>
        <CardSkeleton height={320} sx={{ flex: 1 }} />
      </Grid>

      <Grid xs={12} md={12} lg={4} sx={{ display: 'flex' }}>
        <CardSkeleton height={320} sx={{ flex: 1 }} />
      </Grid>

      <Grid xs={12} md={12} lg={4} sx={{ display: 'flex' }}>
        <CardSkeleton height={320} sx={{ flex: 1 }} />
      </Grid>

      <Grid xs={12} md={12} lg={4} sx={{ display: 'flex' }}>
        <CardSkeleton height={320} sx={{ flex: 1 }} />
      </Grid>

      <Grid xs={12} md={12} lg={8} sx={{ display: 'flex' }}>
        <CardSkeleton height={400} sx={{ flex: 1 }} />
      </Grid>
    </Grid>
  );
}

// ----------------------------------------------------------------------

export function CustomerDashboardSkeleton() {
  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={12}>
        <Box sx={{ gap: 3, display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(4, 1fr)' } }}>
          {[...Array(4)].map((_, index) => (
            <SummaryTileSkeleton key={index} />
          ))}
        </Box>
      </Grid>

      <Grid xs={12} md={12}>
        <Box sx={{ gap: 3, display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
          {[...Array(4)].map((_, index) => (
            <SummaryTileSkeleton key={index} />
          ))}
        </Box>
      </Grid>

      <Grid xs={12} md={5} lg={4}>
        <CardSkeleton height={360} />
      </Grid>

      <Grid xs={12} md={7} lg={8}>
        <CardSkeleton height={360} />
      </Grid>

      <Grid xs={12} lg={8} sx={{ display: 'flex' }}>
        <CardSkeleton height={440} sx={{ flex: 1 }} />
      </Grid>

      <Grid xs={12} md={6} lg={4} sx={{ display: 'flex' }}>
        <CardSkeleton height={440} sx={{ flex: 1 }} />
      </Grid>

      <Grid xs={12} md={7} lg={8} sx={{ display: 'flex' }}>
        <CardSkeleton height={440} sx={{ flex: 1 }} />
      </Grid>

      <Grid xs={12} md={5} lg={4} sx={{ display: 'flex' }}>
        <CardSkeleton height={440} sx={{ flex: 1 }} />
      </Grid>
    </Grid>
  );
}
