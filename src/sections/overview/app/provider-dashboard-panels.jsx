import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

export function RecentReviewsCard({ reviews = [] }) {
  const { t } = useTranslate();

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6">{t('recentReviews')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('customerFeedback')}
      </Typography>

      {reviews.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, textAlign: 'center' }}>
          <Iconify icon="solar:star-bold-duotone" width={32} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('noReviewsYet')}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {reviews.map((review) => (
            <Box key={review.id} sx={{ p: 1.75, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <Avatar src={review.avatar} sx={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
                  {review.name?.charAt(0)?.toUpperCase() || '?'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" noWrap>{review.name}</Typography>
                    <Rating value={Number(review.rating) || 0} precision={0.5} readOnly size="small" sx={{ flexShrink: 0 }} />
                  </Stack>
                  {review.serviceTitle && (
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {review.serviceTitle}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    "{review.text}"
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Card>
  );
}
