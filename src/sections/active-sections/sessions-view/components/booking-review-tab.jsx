import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { memo, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';
import { useCreateReviewMutation, useUpdateReviewMutation } from 'src/store/Reducer/services-api';
import { varAlpha } from 'src/theme/styles';
import { fDate, formatStr } from 'src/utils/format-time';

import { ReviewDialog } from './review-dialog';

export const BookingReviewTab = memo(({ booking, review, onAdminDeleteReview, onReviewSave }) => {
  const { t } = useTranslate();
  const { user } = useSelector((state) => state.user);
  const userType = user?.user?.accountState?.userType ?? user?.accountState?.userType;
  const isAdmin = userType === 'admin';
  const isCustomer = userType === 'customer' || userType === 'user';

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewDialogMode, setReviewDialogMode] = useState('add');
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdatingReview }] = useUpdateReviewMutation();

  const canManageCustomerReview = isCustomer && booking.status === 'completed';

  const fetchedReview = useMemo(() => {
    const apiReview = booking.review;
    if (!apiReview) return null;
    return {
      id: apiReview._id,
      rating: Number(apiReview.rating || 0),
      feedback: apiReview.comment || '',
      submittedAt: apiReview.createdAt || apiReview.updatedAt,
    };
  }, [booking.review]);

  const displayReview = review ?? fetchedReview;
  const hasContent = Boolean(displayReview?.rating) || Boolean(displayReview?.feedback && String(displayReview.feedback).trim());

  const handleOpenReviewDialog = useCallback(
    (mode) => {
      setReviewDialogMode(mode);
      setReviewDialogOpen(true);
    },
    []
  );

  const handleCloseReviewDialog = useCallback(() => {
    setReviewDialogOpen(false);
  }, []);

  const handleReviewSubmit = useCallback(
    async (data) => {
      if (reviewDialogMode === 'edit' && displayReview?.id) {
        try {
          await updateReview({
            id: displayReview.id,
            rating: data.rating,
            comment: data.feedback,
          }).unwrap();

          const submittedAt = displayReview?.submittedAt ?? new Date().toISOString();
          onReviewSave?.({ ...data, id: displayReview.id, submittedAt });
          toast.success(t('reviewUpdated'));
          setReviewDialogOpen(false);
        } catch (error) {
          toast.error(error?.data?.message || t('somethingWentWrong'));
        }
        return;
      }

      if (!booking._id) {
        toast.error(t('somethingWentWrong'));
        return;
      }

      try {
        const result = await createReview({
          bookingId: booking._id,
          rating: data.rating,
          comment: data.feedback,
        }).unwrap();

        const submittedAt = displayReview?.submittedAt ?? new Date().toISOString();
        onReviewSave?.({ ...data, id: result?.data?._id, submittedAt });
        toast.success(t('reviewSubmitted'));
        setReviewDialogOpen(false);
      } catch (error) {
        toast.error(error?.data?.message || t('somethingWentWrong'));
      }
    },
    [
      reviewDialogMode,
      displayReview?.id,
      displayReview?.submittedAt,
      updateReview,
      createReview,
      booking._id,
      onReviewSave,
      t,
    ]
  );

  const handleRequestDelete = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onAdminDeleteReview?.();
    toast.success(t('reviewDeleted'));
    setConfirmOpen(false);
  }, [onAdminDeleteReview, t]);

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
        boxShadow: (theme) => `0 12px 40px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.12),
            color: 'warning.dark',
          }}
        >
          <Iconify icon="solar:star-bold" width={22} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.3 }}>
          {t('clientReview')}
        </Typography>
      </Stack>

      {!hasContent ? (
        <Box sx={{ py: { xs: 5, md: 6 }, textAlign: 'center', px: 3 }}>
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
            {t('noReviewForBookingYet')}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 340, mx: 'auto', lineHeight: 1.75 }}>
            {canManageCustomerReview
              ? t('shareYourExperiencePrompt')
              : t('reviewsAppearAfterCompleted')}
          </Typography>

          {canManageCustomerReview && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenReviewDialog('add')}
              startIcon={<Iconify icon="solar:star-bold" width={18} />}
              sx={{ mt: 2.5, textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 2.5 }}
            >
              {t('addReview')}
            </Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 2.5,
            bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.04),
            border: (theme) => `1px solid ${varAlpha(theme.vars.palette.warning.mainChannel, 0.14)}`,
          }}
        >
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  fontWeight: 800,
                  fontSize: 20,
                  bgcolor: 'warning.lighter',
                  color: 'warning.darker',
                  border: '2px solid',
                  borderColor: 'common.white',
                  boxShadow: (theme) => `0 4px 14px ${varAlpha(theme.vars.palette.warning.mainChannel, 0.28)}`,
                }}
              >
                {booking.client?.initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={800} noWrap>
                  {booking.client?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {t('bookedThisService')}
                </Typography>
              </Box>
            </Stack>

            <Stack alignItems="flex-end" spacing={1} sx={{ flexShrink: 0 }}>
              {displayReview?.rating != null && (
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Rating readOnly precision={0.5} value={Number(displayReview.rating)} size="small" sx={{ '& .MuiRating-iconFilled': { color: 'warning.main' } }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'warning.dark', lineHeight: 1 }}>
                    {Number(displayReview.rating).toFixed(1)}
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" spacing={1}>
                {canManageCustomerReview && hasContent && (
                  <Tooltip title={t('editReviewTitle')} arrow placement="top">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenReviewDialog('edit')}
                      sx={{
                        border: (theme) => `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.22)}`,
                        bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.06),
                      }}
                    >
                      <Iconify icon="solar:pen-bold" width={16} />
                    </IconButton>
                  </Tooltip>
                )}

                {isAdmin && onAdminDeleteReview && (
                  <Tooltip title={t('deleteReviewTitle')} arrow placement="top">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={handleRequestDelete}
                      sx={{
                        border: (theme) => `1px solid ${varAlpha(theme.vars.palette.error.mainChannel, 0.22)}`,
                        bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.06),
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          </Stack>

          {displayReview?.feedback && (
            <Box
              sx={{
                pl: 2,
                borderLeft: '3px solid',
                borderColor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.4),
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'text.primary',
                  fontStyle: 'italic',
                  lineHeight: 1.75,
                }}
              >
                {displayReview.feedback}
              </Typography>
            </Box>
          )}

          {displayReview?.submittedAt && (
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 2 }}>
              <Iconify icon="solar:calendar-date-bold" width={14} sx={{ color: 'text.disabled' }} />
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                {t('reviewedOn')} {fDate(displayReview.submittedAt, formatStr.dateTime)}
              </Typography>
            </Stack>
          )}
        </Box>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        title={t('deleteReviewTitle')}
        content={t('deleteReviewMessage', { name: booking.client?.name || '' })}
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            {t('deleteAction')}
          </Button>
        }
      />

      <ReviewDialog
        open={reviewDialogOpen}
        mode={reviewDialogMode}
        review={displayReview}
        isSubmitting={reviewDialogMode === 'edit' ? isUpdatingReview : isSubmittingReview}
        onClose={handleCloseReviewDialog}
        onSubmit={handleReviewSubmit}
      />
    </Card>
  );
});

BookingReviewTab.displayName = 'BookingReviewTab';
