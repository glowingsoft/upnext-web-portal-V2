import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

function DetailRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ py: 0.75 }}>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          flex: '0 0 45%',
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          textAlign: 'right',
          flex: '1 1 55%',
        }}
      >
        {value ?? '—'}
      </Typography>
    </Stack>
  );
}

function SectionDivider({ title }) {
  return (
    <Box sx={{ mt: 1.5, mb: 0.5 }}>
      {title && (
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            letterSpacing: 1,
          }}
        >
          {title}
        </Typography>
      )}

      <Divider
        sx={{
          mt: title ? 0.5 : 0,
        }}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function PromotionViewDialog({ open, onClose, promotion, onEdit }) {
  if (!promotion) return null;

  const discountDisplay = promotion.discountType === 'percentage' ? `${promotion.discountValue}%` : fCurrency(promotion.discountValue);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">View Promotion</Typography>

        <IconButton size="small" onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
        {/* Promo Header Card */}
        <Box
          sx={{
            mb: 2.5,
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.neutral',
          }}
        >
          <Typography variant="h5" fontWeight={700} align="center">
            {promotion.name}
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{
              color: 'text.secondary',
              mt: 0.5,
            }}
          >
            {promotion.description}
          </Typography>
        </Box>

        {/* Core Details */}
        <Stack
          divider={
            <Divider
              sx={{
                borderStyle: 'dashed',
              }}
            />
          }
        >
          <DetailRow
            label="Promo Type"
            value={
              <Label variant="soft" color="info">
                {promotion.promoType}
              </Label>
            }
          />

          <DetailRow label="Promo Code" value={promotion.promoCode || '—'} />

          <DetailRow
            label="Discount Type"
            value={
              <Label variant="soft" color="warning">
                {promotion.discountType}
              </Label>
            }
          />

          <DetailRow
            label="Discount"
            value={
              <Typography
                fontWeight={700}
                sx={{
                  color: 'primary.main',
                }}
              >
                {discountDisplay}
              </Typography>
            }
          />
        </Stack>

        {/* Applied To */}
        <SectionDivider title="Applied To" />

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: (theme) => `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                bgcolor: 'background.neutral',
                overflow: 'hidden',
              }}
            >
              {promotion.appliedTo?.image ? (
                <Box
                  component="img"
                  src={promotion.appliedTo.image}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : null}
            </Box>

            <Box>
              <Typography fontWeight={600}>{promotion.appliedTo?.name}</Typography>

              <Typography variant="caption" color="text.secondary">
                Service / Package
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Limits */}
        <SectionDivider title="Usage Limits" />

        <Stack
          divider={
            <Divider
              sx={{
                borderStyle: 'dashed',
              }}
            />
          }
        >
          <DetailRow label="Total Usage Limit" value={promotion.usageLimit} />

          <DetailRow label="Per User Limit" value={promotion.perUserLimit} />

          <DetailRow label="Redemptions Used" value={promotion.redemptionsUsed ?? promotion.redemptions ?? 0} />
        </Stack>

        {/* Status */}
        <SectionDivider title="Status" />

        <Stack direction="row" spacing={1}>
          <Chip label={promotion.status} color={promotion.status === 'active' ? 'success' : 'warning'} />
        </Stack>

        {promotion.description && (
          <>
            <SectionDivider title="Description" />

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
              }}
            >
              {promotion.description}
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>

        {onEdit && (
          <Button
            variant="contained"
            onClick={() => {
              onClose();
              onEdit(promotion);
            }}
          >
            Edit Promotion
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
