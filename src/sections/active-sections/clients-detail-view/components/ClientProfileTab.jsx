import { Box, Card, Chip, Grid, Stack, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';

import { useTranslate } from 'src/locales/use-locales';

const ACCENT = '#b79a73';
const ACCENT_TINT = '#fff3d8';

const CONTACT_FIELDS = [
  { labelKey: 'phoneNumber', key: 'phone', icon: 'solar:phone-bold' },
  { labelKey: 'emailAddress', key: 'email', icon: 'solar:letter-bold' },
  { labelKey: 'location', key: 'location', icon: 'solar:map-point-bold' },
];

const PREFERENCE_FIELDS = [
  { labelKey: 'preferredCategory', key: 'preferredCategory', icon: 'solar:tag-bold', isList: true },
  { labelKey: 'preferredServiceType', key: 'preferredServiceType', icon: 'solar:layers-bold' },
  { labelKey: 'preferredBookingTime', key: 'preferredBookingTime', icon: 'solar:clock-circle-bold' },
  { labelKey: 'bookingHabitQuestion', key: 'bookingHabit', icon: 'solar:calendar-bold' },
  { labelKey: 'travelDistanceQuestion', key: 'travelDistance', icon: 'solar:routing-bold' },
  { labelKey: 'bookingFrequencyQuestion', key: 'bookingFrequency', icon: 'solar:refresh-circle-bold' },
  { labelKey: 'importantNoteQuestion', key: 'importantNote', icon: 'solar:info-circle-bold', span: 12 },
];

function FieldCard({ label, value, icon, fallback, isList }) {
  const hasList = isList && Array.isArray(value) && value.length > 0;
  const isEmpty = isList ? !hasList : !value;

  return (
    <Box
      sx={{
        px: 2.5,
        py: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.22),
        height: '100%',
        minWidth: 0,
        overflow: 'hidden',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
        '&:hover': {
          borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.32),
          boxShadow: (theme) => `0 10px 24px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <Iconify icon={icon} width={16} sx={{ color: ACCENT, flexShrink: 0 }} />
        <Typography variant="caption" sx={{ color: ACCENT, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </Typography>
      </Box>

      {hasList ? (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ pl: 3, gap: 0.75 }}>
          {value.map((item) => (
            <Chip
              key={item}
              label={item}
              size="small"
              clickable
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 999,
                bgcolor: ACCENT_TINT,
                border: '1px solid',
                borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.35),
                color: 'text.primary',
                transition: 'all 0.18s ease',
                '& .MuiChip-label': { px: 1 },
                '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' },
              }}
            />
          ))}
        </Stack>
      ) : isEmpty ? (
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ pl: 3 }}>
          <Iconify icon="solar:minus-circle-linear" width={14} sx={{ color: 'text.disabled', flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
            {fallback}
          </Typography>
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.primary', pl: 3, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          {value}
        </Typography>
      )}
    </Box>
  );
}

function SectionLabel({ children }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.75 }}>
      <Box sx={{ width: 3, height: 14, borderRadius: 999, bgcolor: ACCENT }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
        {children}
      </Typography>
    </Stack>
  );
}

export default function ClientProfileTab({ client }) {
  const { t } = useTranslate();

  const withLabels = (fields) => fields.map((field) => ({ ...field, label: t(field.labelKey) }));

  return (
    <Stack spacing={3}>
      <Card sx={{ borderRadius: 2, p: 2.5 }}>
        <SectionLabel>{t('contactInformation')}</SectionLabel>
        <Grid container spacing={2}>
          {withLabels(CONTACT_FIELDS).map((field) => (
            <Grid item xs={12} sm={4} key={field.key}>
              <FieldCard label={field.label} value={client?.[field.key]} icon={field.icon} fallback={t('notProvided')} />
            </Grid>
          ))}
        </Grid>
      </Card>

      <Card sx={{ borderRadius: 2, p: 2.5 }}>
        <SectionLabel>{t('bookingPreferences')}</SectionLabel>
        <Grid container spacing={2}>
          {withLabels(PREFERENCE_FIELDS).map((field) => (
            <Grid item xs={12} sm={field.span ?? 6} key={field.key}>
              <FieldCard label={field.label} value={client?.[field.key]} icon={field.icon} fallback={t('notProvided')} isList={field.isList} />
            </Grid>
          ))}
        </Grid>
      </Card>
    </Stack>
  );
}
