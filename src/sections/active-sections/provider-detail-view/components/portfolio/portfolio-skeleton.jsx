import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

export function PortfolioSkeleton() {
  return (
    <Grid container spacing={2.5}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Grid key={index} item xs={12} sm={6} md={4}>
          <Skeleton variant="rounded" sx={{ width: '100%', pt: '75%', borderRadius: 3 }} />
        </Grid>
      ))}
    </Grid>
  );
}
