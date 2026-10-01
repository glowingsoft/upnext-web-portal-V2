import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useGetBadgesQuery } from 'src/store/Reducer/badges-api';
import { BadgeSelect } from '../components/badge-select';

const SKIP_BADGE_NAMES = ['Certifications & Licensing'];

// ----------------------------------------------------------------------

export function StepProviderSpecialties() {
  const { data: badgesData, isLoading, isError } = useGetBadgesQuery({ scope: 'business' });

  const allBadges = Array.isArray(badgesData?.data)
    ? badgesData.data
    : (badgesData?.data?.docs ?? badgesData?.data?.data ?? []);

  const badges = [...allBadges]
    .filter((b) => !SKIP_BADGE_NAMES.includes(b.name?.en ?? b.name ?? ''))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (isError) {
    return (
      <Typography color="error" variant="body2" sx={{ py: 2 }}>
        Failed to load specialties. Please refresh the page.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {badges.map((badge) => (
        <BadgeSelect
          key={badge._id}
          fieldName={`badge_${badge._id}`}
          badge={badge}
        />
      ))}
    </Stack>
  );
}
