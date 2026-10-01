import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';
import { useGetReviewsQuery } from 'src/store/Reducer/services-api';
import { fDate } from 'src/utils/format-time';
import { normalizeReview, normalizeReviewStats } from 'src/utils/reviews';

// ----------------------------------------------------------------------

const REVIEWS_LIMIT = 10;

function ReviewsSkeleton() {
  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' },
          gap: 3,
          alignItems: 'flex-start',
        }}
      >
        <Stack spacing={1} alignItems="center" sx={{ px: 2, py: 1, minWidth: 140 }}>
          <Skeleton variant="text" width={86} height={72} />
          <Skeleton variant="rounded" width={132} height={24} sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" width={90} height={22} />
        </Stack>

        <Stack spacing={1.5} sx={{ flex: 1 }}>
          {[5, 4, 3, 2, 1].map((star) => (
            <Stack key={star} direction="row" alignItems="center" spacing={1}>
              <Skeleton variant="text" width={30} height={20} />
              <Skeleton variant="rounded" height={10} sx={{ flex: 1, borderRadius: 99 }} />
              <Skeleton variant="text" width={28} height={20} />
            </Stack>
          ))}
        </Stack>
      </Box>

      <Divider />

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {[80, 92, 90, 98, 86, 82].map((width) => (
          <Skeleton key={width} variant="rounded" width={width} height={24} sx={{ borderRadius: 999 }} />
        ))}
      </Stack>

      <Divider />

      <ReviewListSkeleton />
    </Stack>
  );
}

function ReviewListSkeleton() {
  return (
    <Stack spacing={1}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Box key={index} sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Skeleton variant="circular" width={36} height={36} />
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Skeleton variant="text" width={140} height={22} />
                <Skeleton variant="text" width={82} height={18} />
              </Stack>
              <Skeleton variant="rounded" width={96} height={18} sx={{ mt: 0.5, borderRadius: 1 }} />
              <Skeleton variant="text" width="92%" height={20} sx={{ mt: 0.75 }} />
              <Skeleton variant="text" width="70%" height={20} />
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function ServiceReviewCard({ review, isAdmin, onRequestDelete }) {
  const { t } = useTranslate();
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: hovered ? 'primary.main' : 'divider',
        bgcolor: hovered ? 'primary.lighter' : 'background.paper',
        transition: 'all 0.2s ease',
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Avatar
          sx={{
            width: 36,
            height: 36,
            fontSize: 14,
            bgcolor: hovered ? 'primary.main' : 'grey.300',
            color: hovered ? 'common.white' : 'text.primary',
            fontWeight: 700,
            transition: 'all 0.2s ease',
          }}
        >
          {review.customerInitial}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>
              {review.customerName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', flexShrink: 0, fontSize: 11 }}>
              {review.createdAt ? fDate(review.createdAt) : ''}
            </Typography>
          </Stack>

          <Rating value={Number(review.rating || 0)} precision={0.5} readOnly size="small" sx={{ mt: 0.25 }} />

          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.55, fontSize: 13 }}>
            {review.comment}
          </Typography>

          {isAdmin && (
            <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mt: 0.5 }}>
              <Tooltip title={t('deleteAction')}>
                <IconButton size="small" color="error" onClick={() => onRequestDelete(review)} sx={{ p: 0.35 }}>
                  <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

export const ServiceReviewsTab = memo(({ service }) => {
  const { t } = useTranslate();
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.accountState?.userType === 'admin';

  const [reviews, setReviews] = useState(() => [...(service.reviews || [])]);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [filterStar, setFilterStar] = useState(null);
  const [page, setPage] = useState(1);

  const { data: reviewsData, isFetching } = useGetReviewsQuery(
    { scope: 'service', targetId: service._id, page, limit: REVIEWS_LIMIT, rating: filterStar || undefined },
    { skip: !service._id }
  );

  const { data: statsData } = useGetReviewsQuery(
    { scope: 'service', targetId: service._id, page: 1, limit: 1 },
    { skip: !service._id }
  );

  const apiReviews = useMemo(
    () => (reviewsData?.data?.reviews || []).map(normalizeReview),
    [reviewsData?.data?.reviews]
  );

  useEffect(() => {
    setReviews(reviewsData ? apiReviews : (service.reviews || []).map(normalizeReview));
    setReviewToDelete(null);
  }, [apiReviews, reviewsData, service._id, service.reviews]);

  useEffect(() => {
    setPage(1);
  }, [service._id, filterStar]);

  const { totalReviews, averageRating, ratingCounts, maxCount } = useMemo(
    () => normalizeReviewStats(statsData?.data?.stats, []),
    [statsData?.data?.stats]
  );
  const totalPages = Math.max(1, Math.ceil(Number(reviewsData?.meta?.total ?? totalReviews) / REVIEWS_LIMIT));

  const displayAverage = useMemo(() => {
    if (totalReviews === 0) return 0;
    return Number.isFinite(averageRating) ? averageRating : 0;
  }, [totalReviews, averageRating]);

  const FILTER_OPTIONS = useMemo(
    () => [
      { label: t('all'), value: null },
      { label: t('fiveStars'), value: 5 },
      { label: t('fourStars'), value: 4 },
      { label: t('threeStars'), value: 3 },
      { label: t('twoStars'), value: 2 },
      { label: t('oneStar'), value: 1 },
    ],
    [t]
  );

  const handleRequestDelete = useCallback((review) => {
    setReviewToDelete(review);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setReviewToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!reviewToDelete?._id) {
      setReviewToDelete(null);
      return;
    }
    setReviews((prev) => prev.filter((r) => r._id !== reviewToDelete._id));
    toast.success(t('reviewDeleted'));
    setReviewToDelete(null);
  }, [reviewToDelete, t]);

  const isInitialLoad = isFetching && !statsData;

  return (
    <Box sx={{ p: 3 }}>
      {isInitialLoad ? (
        <ReviewsSkeleton />
      ) : totalReviews === 0 ? (
        <Box sx={{ py: { xs: 6, md: 8 }, textAlign: 'center', px: 3 }}>
          {/* Star icons row */}
          <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 3 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Box
                key={star}
                sx={{
                  width: 44, height: 44, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: 'rgba(244,196,48,0.08)',
                  border: '1.5px dashed rgba(244,196,48,0.35)',
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'scale(1.15)' },
                }}
              >
                <Iconify icon="solar:star-bold" width={22} sx={{ color: 'rgba(244,196,48,0.45)' }} />
              </Box>
            ))}
          </Stack>

          <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
            {t('noReviewsYet')}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 340, mx: 'auto', lineHeight: 1.75 }}>
            {t('reviewsWillAppear')}
          </Typography>

        </Box>
      ) : (
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' },
              gap: 3,
              alignItems: 'flex-start',
            }}
          >
            <Stack
              spacing={1}
              sx={{
                alignItems: 'center',
                textAlign: 'center',
                px: 2,
                py: 1,
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1,
                  mb: 0.5,
                }}
              >
                {displayAverage ? displayAverage.toFixed(1) : '0.0'}
              </Typography>
              <Rating value={displayAverage} precision={0.5} readOnly size="large" />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {totalReviews} {t('reviews')}
              </Typography>
            </Stack>

            <Stack spacing={1.5} sx={{ flex: 1 }}>
              {ratingCounts.map((item) => (
                <Stack key={item.star} direction="row" alignItems="center" spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 30 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {item.star}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#f4c430' }}>
                      ★
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      flex: 1,
                      height: 10,
                      borderRadius: 99,
                      bgcolor: 'grey.200',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(item.count / maxCount) * 100}%`,
                        height: '100%',
                        borderRadius: 99,
                        bgcolor: '#f4c430',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 28, textAlign: 'right' }}>
                    {item.count}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Divider />

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {FILTER_OPTIONS.map((opt) => (
              <Chip
                key={String(opt.value)}
                label={opt.label}
                size="small"
                color={filterStar === opt.value ? 'primary' : 'default'}
                variant={filterStar === opt.value ? 'filled' : 'outlined'}
                onClick={() => setFilterStar(opt.value)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>

          <Divider />

          {isFetching ? (
            <ReviewListSkeleton />
          ) : reviews.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 52, height: 52, borderRadius: '50%', mx: 'auto', mb: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: 'background.neutral',
                  border: '1.5px dashed',
                  borderColor: 'divider',
                }}
              >
                <Iconify icon="solar:filter-bold-duotone" width={24} sx={{ color: 'text.disabled' }} />
              </Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.secondary', mb: 0.5 }}>
                {t('noReviewsMatchFilter')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {t('tryDifferentStarRating')}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {reviews.map((review) => (
                <ServiceReviewCard key={review._id} review={review} isAdmin={isAdmin} onRequestDelete={handleRequestDelete} />
              ))}
            </Stack>
          )}

          {totalPages > 1 && (
            <Stack alignItems="center" sx={{ pt: 1 }}>
              <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" shape="rounded" />
            </Stack>
          )}

          <ConfirmDialog
            open={Boolean(reviewToDelete)}
            onClose={handleCloseConfirm}
            title={t('deleteReviewTitle')}
            content={t('deleteReviewMessage', {
              name: reviewToDelete?.customerName || '',
              defaultValue: 'Remove this review? This cannot be undone.',
            })}
            action={
              <Button variant="contained" color="error" onClick={handleConfirmDelete}>
                {t('deleteAction')}
              </Button>
            }
          />
        </Stack>
      )}
    </Box>
  );
});

ServiceReviewsTab.displayName = 'ServiceReviewsTab';
