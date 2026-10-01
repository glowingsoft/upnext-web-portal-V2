import PropTypes from 'prop-types';
import { memo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { normalizeReviewStats } from 'src/utils/reviews';

// ----------------------------------------------------------------------

export const ReviewsStatsCard = memo(({ stats }) => {
  const { t } = useTranslate();
  const { totalReviews, averageRating, ratingCounts } = normalizeReviewStats(stats);

  return (
    <Card sx={{ borderRadius: 2, p: 3 }}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} sm="auto">
          <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 100 }}>
            <Typography variant="h2" fontWeight={800} sx={{ lineHeight: 1 }}>
              {Number.isFinite(averageRating) ? averageRating.toFixed(1) : '0.0'}
            </Typography>
            <Rating value={Number.isFinite(averageRating) ? averageRating : 0} precision={0.5} readOnly size="large" />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('totalReviews', { count: totalReviews })}
            </Typography>
          </Stack>
        </Grid>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        <Grid item xs={12} sm>
          <Stack spacing={0.75}>
            {ratingCounts.map(({ star, count }) => {
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <Stack key={star} direction="row" alignItems="center" spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={0.4} sx={{ width: 52 }}>
                    <Typography variant="caption" fontWeight={600}>
                      {star}
                    </Typography>
                    <Iconify icon="solar:star-bold" width={13} sx={{ color: '#f4c430' }} />
                  </Stack>
                  <Box sx={{ flex: 1, height: 8, borderRadius: 6, bgcolor: 'grey.200', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${pct}%`,
                        height: '100%',
                        bgcolor: '#f4c430',
                        borderRadius: 6,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ width: 28, textAlign: 'right', color: 'text.secondary' }}>
                    {count}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
});

ReviewsStatsCard.propTypes = {
  stats: PropTypes.object,
};

ReviewsStatsCard.displayName = 'ReviewsStatsCard';
