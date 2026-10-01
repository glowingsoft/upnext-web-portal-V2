import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

const DIALOG_WHITE = '#ffffff';
const TITLE_BROWN = '#2C2416';
const STAR_ORANGE = '#E8A317';
const SUBMIT_BROWN = '#A68B6D';
const SUBMIT_BROWN_HOVER = '#8f7659';
const BORDER_BEIGE = '#E5D9C8';
const PLACEHOLDER_MUTED = '#B5A899';
const CLOSE_RED = '#9F0000';

// ----------------------------------------------------------------------

export function ReviewDialog({ mode = 'view', open, onClose, review = null, onSubmit, isSubmitting = false }) {
  const { t } = useTranslate();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isForm = mode === 'add' || isEdit;

  useEffect(() => {
    if (!open) return;
    if (isForm && isEdit && review) {
      setRating(Number(review.rating) || 0);
      setFeedback(review.feedback ?? '');
      return;
    }
    if (mode === 'add') {
      setRating(0);
      setFeedback('');
    }
  }, [open, mode, isForm, isEdit, review]);

  const handleSubmit = () => {
    if (!rating) return;
    onSubmit?.({ rating, feedback: feedback.trim() });
  };

  const handleClose = () => {
    setRating(0);
    setFeedback('');
    onClose();
  };

  const title = isView ? t('viewReview') : isEdit ? t('editReview') : t('addReview');

  const paperSx = {
    borderRadius: 3,
    bgcolor: DIALOG_WHITE,
    backgroundImage: 'none',
    boxShadow: (theme) => theme.customShadows?.dialog ?? theme.shadows[24],
    overflow: 'hidden',
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: paperSx }}>
      <IconButton
        size="small"
        onClick={handleClose}
        sx={{
          position: 'absolute', right: 16,
          top: 16, color: 'text.secondary', zIndex: 1
        }}
      >
        <Iconify icon="mingcute:close-line" width={20} />
      </IconButton>

      <DialogContent sx={{ px: 3, pt: 3, pb: 3, bgcolor: DIALOG_WHITE }}>
        <Stack spacing={2.25}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.125rem',
              color: TITLE_BROWN,
              pr: 4,
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Rating
              size="large"
              precision={0.5}
              value={isView ? (review?.rating ?? 0) : rating}
              onChange={isView ? undefined : (_, val) => setRating(val ?? 0)}
              readOnly={isView}
              sx={{
                '& .MuiRating-iconFilled': { color: STAR_ORANGE },
                '& .MuiRating-iconHover': { color: STAR_ORANGE },
                '& .MuiRating-iconEmpty': { color: '#E5D5B8' },
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: 800, fontSize: '0.9375rem', color: TITLE_BROWN }}
            >
              {t('review')}
            </Typography>
            {isView ? (
              <Typography variant="body2" sx={{ color: PLACEHOLDER_MUTED }}>
                {review?.feedback || t('notAvailable')}
              </Typography>
            ) : (
              <TextField
                fullWidth
                multiline
                minRows={4}
                placeholder={t('enterYourReviewPlaceholder')}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: DIALOG_WHITE,
                    fontSize: '0.9375rem',
                    color: TITLE_BROWN,
                    '& fieldset': {
                      borderColor: BORDER_BEIGE,
                    },
                    '&:hover fieldset': {
                      borderColor: BORDER_BEIGE,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: SUBMIT_BROWN,
                      borderWidth: 1,
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: PLACEHOLDER_MUTED,
                    opacity: 1,
                  },
                }}
              />
            )}
          </Box>

          {isForm && (
            <Stack spacing={1.25} alignItems="center" sx={{ pt: 0.5 }}>
              <Button
                fullWidth
                variant="contained"
                disableElevation
                disabled={!rating || isSubmitting}
                onClick={handleSubmit}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 800,
                  fontSize: '1rem',
                  textTransform: 'none',
                  py: 1.35,
                  color: '#fff',
                  bgcolor: SUBMIT_BROWN,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: SUBMIT_BROWN_HOVER, boxShadow: 'none' },
                  '&.Mui-disabled': { bgcolor: SUBMIT_BROWN, opacity: 0.5, color: '#fff' },
                }}
              >
                {isSubmitting ? t('submitting') : t('submit')}
              </Button>
              <Button
                variant="text"
                onClick={handleClose}
                disabled={isSubmitting}
                sx={{
                  color: SUBMIT_BROWN,
                  fontWeight: 500,
                  fontSize: '0.9375rem',
                  textTransform: 'none',
                  minWidth: 'auto',
                  p: 0,
                  '&:hover': { bgcolor: 'transparent', color: SUBMIT_BROWN_HOVER },
                }}
              >
                {t('cancel')}
              </Button>
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
