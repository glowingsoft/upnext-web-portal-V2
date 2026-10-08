import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';

import { Field } from 'src/components/hook-form';
import { useGetBadgesQuery } from 'src/store/Reducer/badges-api';

import { BadgeSelect } from '../components/badge-select';
import { BadgeMultiSelect } from '../components/badge-multi-select';
import { CategoriesMultiSelect } from '../components/categories-multi-select';


const MULTI_SELECT_BADGE_NAMES = [
  'Service Preferences',
];

const getBadgeEnName = (badge) => badge?.translations?.en || badge?.name || '';

// Form field name for a badge
const fieldName = (badge) => 'badge_' + badge._id;

// Step 0: sortOrder 0-2  |  Step 1: sortOrder 3+
const isStep0Badge = (badge) => badge.sortOrder < 3;

export function StepCustomerProfile({ step }) {
  const { setValue } = useFormContext();
  const { data: badgesData, isLoading: badgesLoading, isError } = useGetBadgesQuery({ scope: 'user' });

  const allBadges = Array.isArray(badgesData?.data)
    ? badgesData.data
    : (badgesData?.data?.docs ?? badgesData?.data?.data ?? []);

  const userBadges = [...allBadges].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const step0Badges = userBadges.filter(isStep0Badge);
  const step1Badges = userBadges.filter((b) => !isStep0Badge(b));

  if (badgesLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (isError) {
    return (
      <Typography color="error" variant="body2" sx={{ py: 2 }}>
        Failed to load preferences. Please refresh the page.
      </Typography>
    );
  }

  // ── Step 0: Location, Categories, step-0 badges, Description ──
  if (step === 0) {
    return (
      <Stack spacing={2.25}>
        <Field.AddressAutocomplete
          name="locationAddress"
          label="Location"
          InputLabelProps={{ shrink: true }}
          onPlaceSelected={({ lat, lng }) => {
            setValue('locationLat', lat, { shouldDirty: true });
            setValue('locationLng', lng, { shouldDirty: true });
          }}
        />

        <CategoriesMultiSelect name="categories" label="Preferred Category" scope="user" />

        {step0Badges.map((badge) =>
          MULTI_SELECT_BADGE_NAMES.includes(getBadgeEnName(badge)) ? (
            <BadgeMultiSelect key={badge._id} fieldName={fieldName(badge)} badge={badge} />
          ) : (
            <BadgeSelect key={badge._id} fieldName={fieldName(badge)} badge={badge} />
          )
        )}

        <Field.Text
          name="description"
          label="Anything Important We Should Know?"
          InputLabelProps={{ shrink: true }}
          placeholder="Describe in a few words..."
          multiline
          rows={3}
          inputProps={{ maxLength: 200 }}
        />
      </Stack>
    );
  }

  // ── Step 1: Booking badges ──
  return (
    <Stack spacing={2.25}>
      {step1Badges.map((badge) => (
        <BadgeSelect key={badge._id} fieldName={fieldName(badge)} badge={badge} />
      ))}
    </Stack>
  );
}

StepCustomerProfile.propTypes = {
  step: PropTypes.number,
};
