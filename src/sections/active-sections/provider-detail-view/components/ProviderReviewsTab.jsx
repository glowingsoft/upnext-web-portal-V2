import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Box, Button, Card, Chip, Divider, Grid, IconButton, Pagination, Rating, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { usePathname } from 'src/routes/hooks';
import { useTranslate } from 'src/locales/use-locales';
import { useGetReviewsQuery } from 'src/store/Reducer/services-api';
import { useGetBusinessReviewsQuery, useGetBusinessReviewsPublicQuery } from 'src/store/Reducer/businesses-api';
import { normalizeReview, normalizeReviewStats } from 'src/utils/reviews';

const REVIEWS_LIMIT = 10;

function ReviewsSkeleton() {
  return (
    <Stack spacing={2.5}>
      <Card sx={{ borderRadius: 2, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 100 }}>
              <Skeleton variant="text" width={82} height={64} />
              <Skeleton variant="rounded" width={110} height={20} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={78} height={18} />
            </Stack>
          </Grid>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

          <Grid item xs={12} sm>
            <Stack spacing={0.75}>
              {[5, 4, 3, 2, 1].map((star) => (
                <Stack key={star} direction="row" alignItems="center" spacing={1.5}>
                  <Skeleton variant="text" width={52} height={20} />
                  <Skeleton variant="rounded" height={8} sx={{ flex: 1, borderRadius: 6 }} />
                  <Skeleton variant="text" width={28} height={20} />
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Card>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {[70, 88, 86, 94, 82, 78].map((width) => (
          <Skeleton key={width} variant="rounded" width={width} height={32} sx={{ borderRadius: 999 }} />
        ))}
      </Stack>

      <ReviewListSkeleton />
    </Stack>
  );
}

function ReviewListSkeleton() {
  return (
    <Stack spacing={2}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} sx={{ p: 1.5, borderRadius: 2 }}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Skeleton variant="circular" width={36} height={36} />
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Skeleton variant="text" width={140} height={22} />
                <Skeleton variant="text" width={96} height={18} />
              </Stack>
              <Skeleton variant="rounded" width={92} height={16} sx={{ mt: 0.5, borderRadius: 1 }} />
              <Skeleton variant="text" width="94%" height={20} sx={{ mt: 0.75 }} />
              <Skeleton variant="text" width="68%" height={20} />
            </Box>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

function ReviewsEmptyState({ t }) {
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, textAlign: 'center', px: 3 }}>
      <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 3 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Box
            key={star}
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
        Reviews will appear here once available.
      </Typography>
    </Box>
  );
}

function ReviewCard({ review, dateLocale, isAdmin, onRequestDelete }) {
  const { t } = useTranslate();
  const [hovered, setHovered] = useState(false);
  const reviewDate = review.date || review.createdAt;

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
          {review.customerInitial || review.reviewer?.charAt(0)}
        </Avatar>

        <Box flex={1} sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: 13, lineHeight: 1.3 }}>
              {review.reviewer}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', flexShrink: 0, fontSize: 11 }}>
              {reviewDate ? new Date(reviewDate).toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
            </Typography>
          </Stack>

          <Rating value={Number(review.rating || 0)} precision={0.5} readOnly size="small" />

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

export default function ProviderReviewsTab({ provider, isPublicView = false }) {

  const { t, currentLang } = useTranslate();
  const pathname = usePathname();

  const { user } = useSelector((state) => state.user);

  const isAdmin = user?.accountState?.userType === 'admin';
  const isAdminRoute = pathname.includes('/admin-dashboard');
  const targetId = provider.businessProfileId || provider.profileId || provider.business?._id || provider._id;

  const [reviews, setReviews] = useState(() => [...(provider.reviews ?? [])]);

  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');

  const genericReviewsResult = useGetReviewsQuery(
    { scope: 'business', targetId, page, limit: REVIEWS_LIMIT, rating: activeFilter === 'all' ? undefined : activeFilter },
    { skip: !targetId || isAdminRoute || isPublicView }
  );
  const adminBusinessReviewsResult = useGetBusinessReviewsQuery(
    { businessId: targetId, page, limit: REVIEWS_LIMIT, rating: activeFilter === 'all' ? undefined : activeFilter },
    { skip: !targetId || !isAdminRoute }
  );
  const publicBusinessReviewsResult = useGetBusinessReviewsPublicQuery(
    { businessId: targetId, page, limit: REVIEWS_LIMIT, rating: activeFilter === 'all' ? undefined : activeFilter },
    { skip: !targetId || !isPublicView }
  );
  const { data: reviewsData, isFetching } = isAdminRoute
    ? adminBusinessReviewsResult
    : isPublicView
      ? publicBusinessReviewsResult
      : genericReviewsResult;

  // Kept separate from the (possibly filtered) queries above so the average/rating
  // breakdown never shifts when a star filter is applied — stats always reflect all reviews.
  const genericStatsResult = useGetReviewsQuery(
    { scope: 'business', targetId, page: 1, limit: 1 },
    { skip: !targetId || isAdminRoute || isPublicView }
  );
  const adminStatsResult = useGetBusinessReviewsQuery(
    { businessId: targetId, page: 1, limit: 1 },
    { skip: !targetId || !isAdminRoute }
  );
  const publicStatsResult = useGetBusinessReviewsPublicQuery(
    { businessId: targetId, page: 1, limit: 1 },
    { skip: !targetId || !isPublicView }
  );
  const { data: statsData } = isAdminRoute ? adminStatsResult : isPublicView ? publicStatsResult : genericStatsResult;

  const apiReviews = useMemo(
    () => (reviewsData?.data?.reviews || (Array.isArray(reviewsData?.data) ? reviewsData.data : []) || []).map(normalizeReview),
    [reviewsData?.data]
  );

  useEffect(() => {
    setReviews(reviewsData ? apiReviews : (provider.reviews ?? []).map(normalizeReview));
    setReviewToDelete(null);
  }, [apiReviews, provider._id, provider.reviews, reviewsData]);

  useEffect(() => {
    setPage(1);
    setActiveFilter('all');
  }, [targetId]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  const stats = useMemo(
    () => normalizeReviewStats(statsData?.data?.stats, []),
    [statsData?.data?.stats]
  );
  const totalReviews = Number(stats.totalReviews ?? 0);
  const averageRating = Number(stats.averageRating ?? 0);
  const breakdown = useMemo(
    () => stats.ratingCounts.reduce((acc, item) => ({ ...acc, [item.star]: item.count }), {}),
    [stats.ratingCounts]
  );
  const totalPages = Math.max(1, Math.ceil(Number(reviewsData?.meta?.total ?? totalReviews) / REVIEWS_LIMIT));

  const FILTER_OPTIONS = [
    { value: 'all', label: t('all') },
    { value: 5, label: t('fiveStars') },
    { value: 4, label: t('fourStars') },
    { value: 3, label: t('threeStars') },
    { value: 2, label: t('twoStars') },
    { value: 1, label: t('oneStar') },
  ];

  const handleRequestDelete = useCallback((review) => {
    setReviewToDelete(review);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setReviewToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!reviewToDelete?.id && !reviewToDelete?._id) {
      setReviewToDelete(null);
      return;
    }
    const reviewId = reviewToDelete.id || reviewToDelete._id;
    setReviews((prev) => prev.filter((r) => (r.id || r._id) !== reviewId));
    toast.success(t('reviewDeleted'));
    setReviewToDelete(null);
  }, [reviewToDelete, t]);

  const dateLocale = currentLang?.value || 'en-US';
  const isInitialLoad = isFetching && !statsData;

  if (isInitialLoad) {
    return <ReviewsSkeleton />;
  }

  return (
    <Stack spacing={2.5}>
      {/* Summary card */}
      <Card sx={{ borderRadius: 2, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          {/* Big score */}
          <Grid item xs={12} sm="auto">
            <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 100 }}>
              <Typography variant="h2" fontWeight={800} sx={{ lineHeight: 1 }}>
                {Number.isFinite(averageRating) ? averageRating.toFixed(1) : '0.0'}
              </Typography>
              <Rating value={Number.isFinite(averageRating) ? averageRating : 0} precision={0.5} readOnly size="large" />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {totalReviews} {t('reviews')}
              </Typography>
            </Stack>
          </Grid>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

          {/* Breakdown bars */}
          <Grid item xs={12} sm>
            <Stack spacing={0.75}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = breakdown?.[star] ?? 0;
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

      {/* Filter chips */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {FILTER_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            size="small"
            color={activeFilter === opt.value ? 'primary' : 'default'}
            variant={activeFilter === opt.value ? 'filled' : 'outlined'}
            onClick={() => setActiveFilter(opt.value)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Stack>

      {/* Review cards */}
      {totalReviews === 0 ? (
        <Card sx={{ borderRadius: 2, p: 0 }}>
          <ReviewsEmptyState t={t} />
        </Card>
      ) : isFetching ? (
        <ReviewListSkeleton />
      ) : reviews.length > 0 ? (
        <Stack spacing={2}>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id || review._id}
              review={review}
              dateLocale={dateLocale}
              isAdmin={isAdmin}
              onRequestDelete={handleRequestDelete}
            />
          ))}
        </Stack>
      ) : (
        <Card sx={{ borderRadius: 2, p: 4, textAlign: 'center' }}>
          <Iconify icon="solar:star-outline" width={40} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('noReviewsFoundForFilter')}
          </Typography>
        </Card>
      )}

      {totalPages > 1 && (
        <Stack alignItems="center">
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" shape="rounded" />
        </Stack>
      )}

      <ConfirmDialog
        open={Boolean(reviewToDelete)}
        onClose={handleCloseConfirm}
        title={t('deleteReviewTitle')}
        content={t('deleteReviewMessage', {
          name: reviewToDelete?.reviewer || '',
          defaultValue: 'Remove this review? This cannot be undone.',
        })}
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            {t('deleteAction')}
          </Button>
        }
      />
    </Stack>
  );
}
