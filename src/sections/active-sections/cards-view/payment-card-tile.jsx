import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------

const BRAND_ICONS = {
  visa: 'logos:visa',
  mastercard: 'logos:mastercard',
  amex: 'logos:amex',
  americanexpress: 'logos:amex',
  discover: 'logos:discover',
  diners: 'logos:diners-club',
  dinersclub: 'logos:diners-club',
  jcb: 'logos:jcb',
  unionpay: 'logos:unionpay',
};

function getBrandIcon(brand) {
  const key = String(brand || '').toLowerCase().replace(/[\s_-]/g, '');
  return BRAND_ICONS[key];
}

function getExpiryState(card) {
  const month = Number(card.expMonth);
  const year = Number(card.expYear);
  if (!month || !year) return null;
  const now = new Date();
  const monthsLeft = (year - now.getFullYear()) * 12 + (month - (now.getMonth() + 1));
  if (monthsLeft < 0) return 'expired';
  return monthsLeft <= 1 ? 'expiresSoon' : null;
}

export function PaymentCardTile({ card, onEdit, onDelete, onSetDefault, settingDefault = false }) {
  const { t } = useTranslate();
  const brandIcon = getBrandIcon(card.brand);
  const expiryState = getExpiryState(card);

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: (theme) => theme.transitions.create(['transform', 'box-shadow']),
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows?.z24 ?? theme.shadows[16],
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          p: 2.5,
          minHeight: 160,
          color: 'common.white',
          background: 'linear-gradient(135deg, #241b13 0%, #8a7052 55%, #a68e6b 100%)',
        }}
      >
        <Box sx={{ position: 'absolute', top: -36, right: -24, width: 120, height: 120, borderRadius: '50%', bgcolor: varAlpha('255 255 255', 0.08) }} />
        <Box sx={{ position: 'absolute', bottom: -46, left: -18, width: 130, height: 130, borderRadius: '50%', bgcolor: varAlpha('255 255 255', 0.06) }} />

        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: 40,
              height: 28,
              borderRadius: 0.75,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #f6e7c1, #d8b975)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.55,
                background: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.18) 4px, rgba(0,0,0,0.18) 5px)',
              }}
            />
          </Box>

          {brandIcon ? (
            <Box sx={{ bgcolor: 'common.white', borderRadius: 0.75, px: 0.5, py: 0.25, display: 'flex', alignItems: 'center' }}>
              <Iconify icon={brandIcon} width={34} />
            </Box>
          ) : (
            <Iconify icon="solar:card-bold" width={26} sx={{ color: varAlpha('255 255 255', 0.85) }} />
          )}
        </Stack>

        <Typography
          sx={{
            position: 'relative',
            mt: 3,
            fontFamily: '"Roboto Mono", monospace',
            fontSize: { xs: 17, sm: 19 },
            letterSpacing: 2,
            fontWeight: 600,
          }}
        >
          {card.cardNumber}
        </Typography>

        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ position: 'relative', mt: 2.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: varAlpha('255 255 255', 0.7), textTransform: 'uppercase', letterSpacing: 0.6, display: 'block' }}>
              {t('cardHolderName')}
            </Typography>
            <Typography variant="subtitle2" noWrap sx={{ maxWidth: 170 }}>
              {card.cardHolderName || '-'}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right', flexShrink: 0, pl: 1 }}>
            <Typography variant="caption" sx={{ color: varAlpha('255 255 255', 0.7), textTransform: 'uppercase', letterSpacing: 0.6, display: 'block' }}>
              {t('expiryDate')}
            </Typography>
            <Typography variant="subtitle2">{card.expiryDate}</Typography>
          </Box>
        </Stack>
      </Box>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
          {card.isDefault && (
            <Label color="primary" variant="soft">
              {t('defaultCard')}
            </Label>
          )}
          {expiryState && (
            <Label color={expiryState === 'expired' ? 'error' : 'warning'} variant="soft">
              {expiryState === 'expired' ? t('expired') : t('expiresSoon', { defaultValue: 'Expires soon' })}
            </Label>
          )}
          {!card.isDefault && onSetDefault && expiryState !== 'expired' && (
            <Button
              size="small"
              color="primary"
              disabled={settingDefault}
              onClick={() => onSetDefault(card)}
              sx={{ px: 1, minWidth: 0, textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              {t('setAsDefault', { defaultValue: 'Set as default' })}
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Tooltip title={t('editCard')}>
            <IconButton size="small" onClick={() => onEdit?.(card)}>
              <Iconify icon="solar:pen-bold" width={17} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('deleteCard')}>
            <IconButton size="small" color="error" onClick={() => onDelete?.(card.id)}>
              <Iconify icon="solar:trash-bin-trash-bold" width={17} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Card>
  );
}
