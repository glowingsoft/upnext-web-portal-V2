import { Box, Skeleton } from '@mui/material';

import SurfaceCard from './SurfaceCard';

// ----------------------------------------------------------------------

export default function CardSkeleton() {
  return (
    <SurfaceCard sx={{ overflow: 'hidden', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="rectangular" height={200} animation="wave" sx={{ transform: 'none' }} />
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width="70%" height={26} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="45%" height={16} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="85%" height={14} sx={{ mb: 1.5 }} />
        <Skeleton variant="text" width="55%" height={20} />
      </Box>
    </SurfaceCard>
  );
}
