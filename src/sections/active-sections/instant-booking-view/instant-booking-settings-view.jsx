import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { varAlpha } from 'src/theme/styles';
import { useGetInstantSettingsQuery, useUpdateInstantSettingsMutation } from 'src/store/Reducer/settings-api';

const UNIT_SUFFIX = {
  percent: '%',
  sec: 'sec',
  min: 'min',
  hours: 'hrs',
  days: 'days',
  km: 'km',
  points: 'pts',
};

const WEIGHT_COLORS = ['primary', 'info', 'success', 'warning'];

const SECTIONS = [
  {
    key: 'pricing',
    icon: 'solar:wallet-money-bold-duotone',
    title: 'Pricing & fees',
    description: 'What customers pay to book instantly and how much is taken up front.',
    fields: [
      { name: 'feeRatePercent', label: 'Booking fee rate', unit: 'percent', max: 100, helper: 'Percentage of the service price charged as the booking fee.' },
      { name: 'feeFloorCents', label: 'Minimum booking fee', unit: 'usd', helper: 'The booking fee is never lower than this.' },
      { name: 'feeCapCents', label: 'Maximum booking fee', unit: 'usd', helper: 'The booking fee is never higher than this.' },
      { name: 'minInstantPriceCents', label: 'Minimum service price', unit: 'usd', helper: 'Services cheaper than this cannot be booked instantly.' },
      { name: 'depositPercent', label: 'Deposit', unit: 'percent', max: 100, helper: 'Share of the service price paid when the booking is confirmed.' },
    ],
  },
  {
    key: 'timing',
    icon: 'solar:clock-circle-bold-duotone',
    title: 'Response times',
    description: 'How long each side has to act before the request moves on or expires.',
    fields: [
      { name: 'providerAcceptSec', label: 'Provider accept time (same day)', unit: 'sec', integer: true, helper: 'Time a provider has to accept a request for today.' },
      { name: 'providerAcceptSecAdvance', label: 'Provider accept time (advance)', unit: 'sec', integer: true, helper: 'Time a provider has to accept a request for a later day.' },
      { name: 'customerDecisionSec', label: 'Customer decision time', unit: 'sec', integer: true, helper: 'Time the customer has to pick from the providers who accepted.' },
      { name: 'paymentSec', label: 'Payment time', unit: 'sec', integer: true, helper: 'Time the customer has to pay after choosing a provider.' },
      { name: 'maxAttemptMinutes', label: 'Maximum search time', unit: 'min', integer: true, helper: 'The whole request expires after this long.' },
      { name: 'maxAdvanceDays', label: 'Book up to', unit: 'days', integer: true, helper: 'How far ahead an instant booking can be made.' },
    ],
  },
  {
    key: 'matching',
    icon: 'solar:map-point-search-bold-duotone',
    title: 'Provider matching',
    description: 'Which providers receive a request, and how they are ranked.',
    fields: [
      { name: 'maxProviders', label: 'Providers per request', unit: 'count', integer: true, min: 1, helper: 'How many providers are offered each request.' },
      { name: 'radiusKm', label: 'Search radius', unit: 'km', helper: 'Only providers within this distance are offered the request.' },
    ],
    weights: [
      { name: 'scoringWeights.travelTime', label: 'Travel time', helper: 'Favours providers who are closer.' },
      { name: 'scoringWeights.rating', label: 'Rating', helper: 'Favours better-rated providers.' },
      { name: 'scoringWeights.acceptanceRate', label: 'Acceptance rate', helper: 'Favours providers who accept more often.' },
      { name: 'scoringWeights.similarity', label: 'Service match', helper: 'Favours providers whose services match best.' },
    ],
  },
  {
    key: 'penalties',
    icon: 'solar:shield-warning-bold-duotone',
    title: 'Penalties & no-shows',
    description: 'What happens when providers miss requests or a booking is a no-show.',
    fields: [
      { name: 'penaltyDeductionCents', label: 'Penalty amount', unit: 'usd', helper: 'Deducted from the provider for each penalty.' },
      { name: 'penaltyWindowDays', label: 'Penalty window', unit: 'days', integer: true, helper: 'Penalties are counted within this many days.' },
      { name: 'timeoutStreakLimit', label: 'Missed requests before suspension', unit: 'count', integer: true, min: 1, helper: 'Requests a provider can let expire in a row.' },
      { name: 'suspensionHours', label: 'Suspension length', unit: 'hours', integer: true, helper: 'How long the provider stops receiving instant requests.' },
      { name: 'noShowReportWindowMin', label: 'No-show report window', unit: 'min', integer: true, helper: 'Time after the start to report a no-show.' },
      { name: 'noShowContestWindowHours', label: 'No-show contest window', unit: 'hours', integer: true, helper: 'Time the other side has to dispute a no-show report.' },
    ],
  },
];

const SERVER_FIELDS = [
  { name: 'offerWindowSec', label: 'Offer window', unit: 'sec' },
  { name: 'maxSearchSec', label: 'Maximum search', unit: 'sec' },
  { name: 'instantPayoutFeePercent', label: 'Instant payout fee', unit: 'percent' },
];

const EXAMPLE_PRICES = [25, 50, 100, 300];

const formatUsd = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const WEIGHT_FIELDS = SECTIONS.flatMap((section) => (section.weights || []).map((weight) => ({ ...weight, unit: 'points' })));
const ALL_FIELDS = [...SECTIONS.flatMap((section) => section.fields), ...WEIGHT_FIELDS];

const formName = (name) => name.replace('.', '__');

const SECTION_OF_FIELD = SECTIONS.reduce((acc, section) => {
  [...section.fields, ...(section.weights || [])].forEach((field) => {
    acc[formName(field.name)] = section.key;
  });
  return acc;
}, {});

const getPath = (obj, path) => path.split('.').reduce((acc, key) => acc?.[key], obj);

const setPath = (obj, path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((acc, key) => {
    acc[key] = acc[key] || {};
    return acc[key];
  }, obj);
  target[last] = value;
  return obj;
};

const toFormValue = (field, value) => {
  if (value == null || value === '') return '';
  return field.unit === 'usd' ? (Number(value) / 100).toFixed(2) : String(value);
};

const fromFormValue = (field, value) => {
  const num = Number(value);
  return field.unit === 'usd' ? Math.round(num * 100) : num;
};

function buildSchema() {
  const shape = {};
  ALL_FIELDS.forEach((field) => {
    shape[formName(field.name)] = zod
      .string()
      .trim()
      .min(1, 'Required')
      .refine((value) => !Number.isNaN(Number(value)), 'Enter a number')
      .refine((value) => Number(value) >= (field.min ?? 0), field.min ? `Must be at least ${field.min}` : 'Cannot be negative')
      .refine((value) => field.max == null || Number(value) <= field.max, `Must be ${field.max} or less`)
      .refine((value) => !field.integer || Number.isInteger(Number(value)), 'Use a whole number');
  });

  return zod.object(shape).superRefine((values, ctx) => {
    if (Number(values.feeFloorCents) > Number(values.feeCapCents)) {
      ctx.addIssue({ code: zod.ZodIssueCode.custom, path: ['feeCapCents'], message: 'Must be at least the minimum fee' });
    }
  });
}

function toFormValues(settings) {
  return ALL_FIELDS.reduce((acc, field) => {
    acc[formName(field.name)] = toFormValue(field, getPath(settings, field.name));
    return acc;
  }, {});
}

function formatDuration(unit, rawValue) {
  const value = Number(rawValue);
  if (!rawValue || Number.isNaN(value) || value <= 0) return '';
  const seconds = unit === 'sec' ? value : unit === 'min' ? value * 60 : null;
  if (seconds == null || seconds < 60) return '';
  const round = (n) => (Number.isInteger(n) ? n : n.toFixed(1));
  if (seconds < 3600) return unit === 'sec' ? `${round(seconds / 60)} min` : '';
  return `${round(seconds / 3600)} hr`;
}

function FieldLabel({ label, helper, changed, sx }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75, minWidth: 0, ...sx }}>
      <Typography variant="subtitle2" noWrap sx={{ minWidth: 0 }}>
        {label}
      </Typography>
      <Tooltip title={helper} arrow placement="top">
        <Box component="span" sx={{ display: 'inline-flex', color: 'text.disabled', cursor: 'help', flexShrink: 0 }}>
          <Iconify icon="solar:info-circle-linear" width={16} />
        </Box>
      </Tooltip>
      {changed && (
        <Tooltip title="Changed" arrow>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
        </Tooltip>
      )}
    </Stack>
  );
}

function SettingField({ field, control, changed }) {
  return (
    <Controller
      name={formName(field.name)}
      control={control}
      render={({ field: input, fieldState: { error } }) => {
        const duration = formatDuration(field.unit, input.value);
        return (
          <Box sx={{ minWidth: 0 }}>
            <FieldLabel label={field.label} helper={field.helper} changed={changed} />
            <TextField
              {...input}
              value={input.value ?? ''}
              fullWidth
              size="small"
              inputMode="decimal"
              error={!!error}
              helperText={error?.message || (duration ? `= ${duration}` : ' ')}
              InputProps={{
                ...(field.unit === 'usd' ? { startAdornment: <InputAdornment position="start">$</InputAdornment> } : {}),
                ...(UNIT_SUFFIX[field.unit] ? { endAdornment: <InputAdornment position="end">{UNIT_SUFFIX[field.unit]}</InputAdornment> } : {}),
              }}
            />
          </Box>
        );
      }}
    />
  );
}

function FeePreview({ control }) {
  const [rate, floor, cap, minPrice, deposit] = useWatch({
    control,
    name: ['feeRatePercent', 'feeFloorCents', 'feeCapCents', 'minInstantPriceCents', 'depositPercent'],
  });

  const rows = EXAMPLE_PRICES.map((price) => {
    const eligible = price >= Number(minPrice || 0);
    const rawFee = (price * Number(rate || 0)) / 100;
    const fee = Math.min(Math.max(rawFee, Number(floor || 0)), Number(cap || 0) || rawFee);
    return { price, eligible, fee, deposit: (price * Number(deposit || 0)) / 100 };
  });

  return (
    <Box sx={{ mt: 1, p: 2, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Iconify icon="solar:calculator-minimalistic-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle2">What customers would pay</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Updates as you type
        </Typography>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
        {rows.map((row) => (
          <Box key={row.price} sx={{ p: 1.5, borderRadius: 1.25, bgcolor: 'background.paper', opacity: row.eligible ? 1 : 0.6 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatUsd(row.price)} service
            </Typography>
            {row.eligible ? (
              <>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                  <Typography variant="body2">Booking fee</Typography>
                  <Typography variant="subtitle2">{formatUsd(row.fee)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Deposit</Typography>
                  <Typography variant="subtitle2">{formatUsd(row.deposit)}</Typography>
                </Stack>
              </>
            ) : (
              <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                Below the minimum price, not offered instantly
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function WeightsEditor({ weights, control, dirtyFields }) {
  const theme = useTheme();
  const values = useWatch({ control, name: weights.map((weight) => formName(weight.name)) });
  const numbers = values.map((value) => Math.max(0, Number(value) || 0));
  const total = numbers.reduce((sum, value) => sum + value, 0);

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        How providers are ranked
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Each weight decides how much that factor counts. The bar shows each factor&apos;s share.
      </Typography>

      <Box sx={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', mb: 2.5, bgcolor: 'background.neutral' }}>
        {weights.map((weight, index) =>
          numbers[index] > 0 ? (
            <Tooltip key={weight.name} title={`${weight.label}: ${Math.round((numbers[index] / total) * 100)}%`} arrow>
              <Box sx={{ width: `${(numbers[index] / total) * 100}%`, bgcolor: theme.vars.palette[WEIGHT_COLORS[index]].main }} />
            </Tooltip>
          ) : null
        )}
      </Box>

      <Box sx={{ display: 'grid', gap: { xs: 2.5, md: 3 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
        {weights.map((weight, index) => {
          const color = WEIGHT_COLORS[index];
          const share = total > 0 ? Math.round((numbers[index] / total) * 100) : 0;
          return (
            <Controller
              key={weight.name}
              name={formName(weight.name)}
              control={control}
              render={({ field: input, fieldState: { error } }) => (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: theme.vars.palette[color].main, flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FieldLabel label={weight.label} helper={weight.helper} changed={!!dirtyFields[formName(weight.name)]} sx={{ mb: 0 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                      {share}% share
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Slider
                      value={Math.min(Number(input.value) || 0, 200)}
                      min={0}
                      max={200}
                      step={5}
                      color={color}
                      onChange={(_, value) => input.onChange(String(value))}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      {...input}
                      value={input.value ?? ''}
                      size="small"
                      inputMode="numeric"
                      error={!!error}
                      sx={{ width: 96, flexShrink: 0 }}
                      InputProps={{ endAdornment: <InputAdornment position="end">pts</InputAdornment> }}
                    />
                  </Stack>
                  {error && (
                    <Typography variant="caption" sx={{ color: 'error.main' }}>
                      {error.message}
                    </Typography>
                  )}
                </Box>
              )}
            />
          );
        })}
      </Box>
    </Box>
  );
}

function SectionPanel({ section, control, dirtyFields }) {
  return (
    <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            color: 'primary.main',
            bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
          }}
        >
          <Iconify icon={section.icon} width={26} />
        </Box>
        <Box>
          <Typography variant="h6">{section.title}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {section.description}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ display: 'grid', columnGap: 2.5, rowGap: 1, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
        {section.fields.map((field) => (
          <SettingField key={field.name} field={field} control={control} changed={!!dirtyFields[formName(field.name)]} />
        ))}
      </Box>

      {section.key === 'pricing' && <FeePreview control={control} />}
      {section.weights && <WeightsEditor weights={section.weights} control={control} dirtyFields={dirtyFields} />}
    </Card>
  );
}

function ServerValues({ settings }) {
  const items = SERVER_FIELDS.filter((field) => settings?.[field.name] != null);
  if (items.length === 0) return null;

  return (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      sx={{ mb: 3, gap: 1, px: 2, py: 1.25, borderRadius: 1.5, border: '1px dashed', borderColor: 'divider' }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mr: 1, color: 'text.secondary' }}>
        <Iconify icon="solar:lock-keyhole-minimalistic-bold" width={16} />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Set on the server
        </Typography>
      </Stack>
      {items.map((field) => {
        const duration = formatDuration(field.unit, settings[field.name]);
        return (
          <Box key={field.name} sx={{ px: 1.25, py: 0.5, borderRadius: 99, bgcolor: 'background.neutral', typography: 'caption' }}>
            {field.label}:{' '}
            <Box component="span" sx={{ fontWeight: 700 }}>
              {settings[field.name]} {UNIT_SUFFIX[field.unit]}
            </Box>
            {duration && <Box component="span" sx={{ color: 'text.secondary' }}>{` (${duration})`}</Box>}
          </Box>
        );
      })}
    </Stack>
  );
}

function SettingsSkeleton() {
  return (
    <Box>
      <Card sx={{ p: 3 }}>
        <Skeleton variant="text" sx={{ width: 220, fontSize: '1.25rem', mb: 3 }} />
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={64} />
          ))}
        </Box>
      </Card>
    </Box>
  );
}

export function InstantBookingSettingsView() {
  const { t } = useTranslate();
  const { data, isLoading, isError, refetch } = useGetInstantSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateInstantSettingsMutation();

  const settings = data?.data;
  const schema = useMemo(() => buildSchema(), []);
  const defaultValues = useMemo(() => toFormValues(settings || {}), [settings]);

  const methods = useForm({ mode: 'onChange', resolver: zodResolver(schema), defaultValues });
  const {
    control,
    reset,
    handleSubmit,
    trigger,
    watch,
    formState: { isDirty, dirtyFields },
  } = methods;

  useEffect(() => {
    if (settings) reset(defaultValues);
  }, [settings, defaultValues, reset]);

  const feeFloor = watch('feeFloorCents');
  useEffect(() => {
    if (isDirty) trigger('feeCapCents');
  }, [feeFloor, isDirty, trigger]);

  const changedTotal = Object.keys(dirtyFields).filter((key) => SECTION_OF_FIELD[key]).length;

  const onSubmit = handleSubmit(
    async (values) => {
      const instant = ALL_FIELDS.reduce((acc, field) => setPath(acc, field.name, fromFormValue(field, values[formName(field.name)])), {});
      try {
        await updateSettings({ instant }).unwrap();
        reset(values);
        toast.success('Instant booking settings saved');
      } catch (error) {
        toast.error(error?.data?.message || error?.message || 'Could not save the settings');
      }
    },
    () => toast.error('Please fix the highlighted fields')
  );

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={t('instantBooking', { defaultValue: 'Instant Booking' })}
        links={[{ name: t('dashboard'), href: paths.adminDashboard.root }, { name: t('instantBooking', { defaultValue: 'Instant Booking' }) }]}
        sx={{ mb: 1 }}
      />
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
        Rules for instant bookings: fees, response times, how providers are matched and penalties. Changes apply to new requests.
      </Typography>

      {isLoading ? (
        <SettingsSkeleton />
      ) : isError || !settings ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Could not load the instant booking settings.
          </Typography>
          <Button variant="outlined" onClick={refetch}>
            Try again
          </Button>
        </Card>
      ) : (
        <form onSubmit={onSubmit} noValidate autoComplete="off">
          <ServerValues settings={settings} />

          <Stack spacing={3}>
            {SECTIONS.map((item) => (
              <SectionPanel key={item.key} section={item} control={control} dirtyFields={dirtyFields} />
            ))}
          </Stack>

          {isDirty && (
            <Card
              sx={{
                position: 'sticky',
                bottom: 16,
                zIndex: 3,
                mt: 3,
                px: { xs: 2, md: 3 },
                py: 1.5,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1.5,
                boxShadow: (theme) => theme.customShadows.z16,
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ mr: 'auto' }}>
                {changedTotal === 1 ? '1 unsaved change' : `${changedTotal} unsaved changes`}
              </Typography>
              <Button variant="outlined" color="inherit" disabled={isSaving} onClick={() => reset(defaultValues)}>
                Discard
              </Button>
              <LoadingButton type="submit" variant="contained" color="primary" loading={isSaving}>
                Save changes
              </LoadingButton>
            </Card>
          )}
        </form>
      )}
    </DashboardContent>
  );
}
