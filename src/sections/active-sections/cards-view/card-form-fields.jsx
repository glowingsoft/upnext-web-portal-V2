import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { CardElement } from '@stripe/react-stripe-js';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------

dayjs.extend(customParseFormat);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#1f120a',
      fontFamily: '"Public Sans", sans-serif',
      '::placeholder': { color: '#919EAB' },
    },
    invalid: { color: '#FF5630' },
  },
};

export function AddCardFields({ cardHolderName, onCardHolderNameChange, setDefault, onSetDefaultChange, onCardElementChange, cardError }) {
  const { t } = useTranslate();

  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        label={t('cardHolderName')}
        placeholder={t('nameOnCard', { defaultValue: 'Name on card' })}
        value={cardHolderName}
        onChange={(event) => onCardHolderNameChange(event.target.value)}
      />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {t('cardDetails')}
        </Typography>
        <Box
          sx={{
            px: 1.75,
            py: 1.5,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: cardError ? 'error.main' : (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.24),
          }}
        >
          <CardElement options={CARD_ELEMENT_OPTIONS} onChange={onCardElementChange} />
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1 }}>
          <Iconify icon="solar:lock-keyhole-bold" width={13} sx={{ color: 'text.disabled' }} />
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {t('cardDetailsSecureNote')}
          </Typography>
        </Stack>
        {cardError && (
          <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.5 }}>
            {cardError}
          </Typography>
        )}
      </Box>

      <FormControlLabel
        control={<Switch checked={setDefault} onChange={(event) => onSetDefaultChange(event.target.checked)} />}
        label={t('setAsDefaultCard')}
      />
    </Stack>
  );
}

export function EditCardFields({ values, onChange }) {
  const { t } = useTranslate();
  const expiry = values.expMonth && values.expYear ? dayjs(`${values.expYear}-${String(values.expMonth).padStart(2, '0')}-01`, 'YYYY-MM-DD') : null;

  const handleExpiryChange = (newValue) => {
    if (newValue?.isValid?.()) {
      onChange('expMonth')(newValue.month() + 1);
      onChange('expYear')(newValue.year());
    } else {
      onChange('expMonth')(null);
      onChange('expYear')(null);
    }
  };

  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        label={t('cardHolderName')}
        placeholder={t('nameOnCard', { defaultValue: 'Name on card' })}
        value={values.cardHolderName}
        onChange={(event) => onChange('cardHolderName')(event.target.value)}
      />

      <TextField fullWidth label={t('cardNumber')} value={values.cardNumber} disabled />

      <DatePicker
        views={['year', 'month']}
        format="MM / YYYY"
        value={expiry?.isValid() ? expiry : null}
        onChange={handleExpiryChange}
        slotProps={{
          textField: {
            fullWidth: true,
            label: t('expiryDate'),
          },
        }}
      />

      <FormControlLabel
        control={<Switch checked={Boolean(values.isDefault)} onChange={(event) => onChange('isDefault')(event.target.checked)} />}
        label={t('setAsDefaultCard')}
      />
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function isAddCardFormValid({ cardHolderName, cardComplete }) {
  return Boolean(cardHolderName?.trim() && cardComplete);
}

export function isEditCardFormValid(values) {
  return Boolean(values.cardHolderName?.trim() && values.expMonth && values.expYear);
}
