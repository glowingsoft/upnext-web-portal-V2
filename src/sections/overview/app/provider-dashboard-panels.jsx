import dayjs from 'dayjs';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

const MAX_REVIEWS = 5;

export function RecentReviewsCard({ reviews = [], onViewAll }) {
  const { t } = useTranslate();
  const list = reviews.slice(0, MAX_REVIEWS);

  return (
    <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" noWrap>
            {t('recentReviews')}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {t('customerFeedback')}
          </Typography>
        </Box>

        {onViewAll && list.length > 0 && (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={onViewAll}
            endIcon={<Iconify icon="solar:alt-arrow-right-linear" width={16} />}
            sx={{ px: 1.25, height: 34, flexShrink: 0, borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
          >
            {t('viewAll')}
          </Button>
        )}
      </Stack>

      {list.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, textAlign: 'center' }}>
          <Iconify icon="solar:star-bold-duotone" width={32} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('noReviewsYet')}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.2}>
          {list.map((review) => (
            <Box key={review.id} sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <Avatar src={review.avatar} sx={{ width: 36, height: 36, fontSize: 13, flexShrink: 0, bgcolor: 'primary.lighter', color: 'primary.dark', fontWeight: 700 }}>
                  {review.name?.charAt(0)?.toUpperCase() || '?'}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ columnGap: 1, rowGap: 0.25 }}>
                    <Typography variant="subtitle2" noWrap sx={{ minWidth: 0 }}>
                      {review.name}
                    </Typography>
                    <Rating value={Number(review.rating) || 0} precision={0.5} readOnly size="small" sx={{ flexShrink: 0 }} />
                  </Stack>

                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {[review.serviceTitle, review.createdAt ? dayjs(review.createdAt).format('MMM D, YYYY') : null].filter(Boolean).join(' · ')}
                  </Typography>

                  {review.text && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 0.75, color: 'text.primary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      “{review.text}”
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Card>
  );
}
