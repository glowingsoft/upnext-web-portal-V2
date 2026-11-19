import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import { LoadingButton } from '@mui/lab';

import { Form, Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { useGetBadgesQuery } from 'src/store/Reducer/badges-api';
import { useUploadS3Mutation } from 'src/store/Reducer/auth';
import { findOnsitePreferredServiceType } from 'src/utils/preferred-service-type';
import { useTranslate } from 'src/locales/use-locales';
import { fData } from 'src/utils/format-number';
import { CANCELLATION_POLICY_OPTIONS, DEFAULT_CANCELLATION_POLICY } from 'src/utils/cancellation-policy';
import { CancellationPolicyField } from 'src/components/cancellation-policy-field/cancellation-policy-field';

import { ServiceCategoryField } from './service-category-field';
import { SetSlotsDialog } from './set-slots-dialog';

// ----------------------------------------------------------------------

function createServiceSchema(t) {
  const requiredText = (field) => zod.string().trim().min(1, t('fieldRequired', { field }));

  return zod.object({
    name: requiredText(t('serviceName')),
    description: zod.string().trim().max(300, t('descriptionMaxLength')).optional(),
    category: requiredText(t('serviceCategory')),
    concurrentClients: requiredText(t('numberOfConcurrentClients')),
    price: requiredText(t('price')),
    cancellationPolicy: zod.enum(CANCELLATION_POLICY_OPTIONS.map((option) => option.value)),
    isAvailable: zod.boolean(),
    status: zod.enum(['active', 'inactive']),
  });
}

const defaultValues = {
  name: '',
  description: '',
  category: '',
  concurrentClients: '',
  price: '',
  cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
  isAvailable: true,
  status: 'active',
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DAY_MAP = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

const REVERSE_DAY_MAP = {
  Mon: 'monday', Tue: 'tuesday', Wed: 'wednesday',
  Thu: 'thursday', Fri: 'friday', Sat: 'saturday', Sun: 'sunday',
};

function convertSlotsToApi(slotsData) {
  if (!slotsData?.operatingHours) return [];
  return Object.entries(slotsData.operatingHours).map(([day, config]) => ({
    dayOfWeek: DAY_MAP[day],
    isOpen: Boolean(config.enabled),
    intervals: (config.intervals || []).map((iv) => ({
      open: iv.start,
      close: iv.end,
      isOvernight: false,
    })),
  }));
}

function convertApiSlotsToForm(apiSlots, sessionSlotMins, gapBetweenSlotMins, sameAsBusinessHours) {
  const operatingHours = {};
  (apiSlots || []).forEach((slot) => {
    const day = REVERSE_DAY_MAP[slot.dayOfWeek];
    if (day) {
      operatingHours[day] = {
        enabled: slot.isOpen,
        intervals: (slot.intervals || []).map((iv) => ({ start: iv.open, end: iv.close })),
      };
    }
  });
  DAYS.forEach((day) => {
    if (!operatingHours[day]) {
      operatingHours[day] = { enabled: false, intervals: [{ start: '09:00', end: '18:00' }] };
    }
  });
  return {
    sessionSlotMins: sessionSlotMins != null ? String(sessionSlotMins) : '30',
    gapMins: gapBetweenSlotMins != null ? String(gapBetweenSlotMins) : '0',
    useSameAsBusinessHours: Boolean(sameAsBusinessHours),
    operatingHoursEnabled: true,
    operatingHours,
  };
}

function mapApiToFormValues(raw) {
  return {
    name: raw.name ?? '',
    description: raw.description ?? '',
    category: raw.category?._id ?? (typeof raw.category === 'string' ? raw.category : ''),
    concurrentClients: raw.concurrentClients != null ? String(raw.concurrentClients) : '',
    price: raw.price != null ? String(raw.price) : '',
    cancellationPolicy: CANCELLATION_POLICY_OPTIONS.some((option) => option.value === raw.cancellationPolicy) ? raw.cancellationPolicy : DEFAULT_CANCELLATION_POLICY,
    isAvailable: raw.isAvailable !== undefined ? Boolean(raw.isAvailable) : true,
    status: raw.status === 'inactive' ? 'inactive' : 'active',
  };
}

function getInitialPhotos(editData) {
  if (!editData) return [];
  return (editData.photos || []).filter(Boolean);
}

// ----------------------------------------------------------------------

function SectionHeader({ title }) {
  return (
    <Box sx={{ mt: 1, mb: 0.5 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1 }}>
        {title}
      </Typography>
      <Divider sx={{ mt: 0.5 }} />
    </Box>
  );
}

function SwitchLabelWithTooltip({ label, tooltip }) {
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        {label}
      </Box>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

export function ServiceForm({ editData, onSubmit, onCancel }) {
  const { t } = useTranslate();
  const isEdit = Boolean(editData);
  const [slotsDialogOpen, setSlotsDialogOpen] = useState(false);
  const [slots, setSlots] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [slotsError, setSlotsError] = useState('');

  const [uploadS3] = useUploadS3Mutation();

  const { data: badgesData } = useGetBadgesQuery({});
  const allBadges = Array.isArray(badgesData?.data)
    ? badgesData.data
    : (badgesData?.data?.docs ?? badgesData?.data?.data ?? []);
  const preferredServiceType = findOnsitePreferredServiceType(allBadges);

  const ServiceSchema = useMemo(() => createServiceSchema(t), [t]);

  const methods = useForm({
    resolver: zodResolver(ServiceSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const nameValue = watch('name');
  const descriptionValue = watch('description');

  useEffect(() => {
    if (editData) {
      reset(mapApiToFormValues(editData));
      setSlots(convertApiSlotsToForm(editData.slots, editData.sessionSlotMins, editData.gapBetweenSlotMins, editData.sameAsBusinessHours));
      setPhotos(getInitialPhotos(editData));
    } else {
      reset(defaultValues);
      setSlots(null);
      setPhotos([]);
    }
    setPhotoError('');
    setSlotsError('');
  }, [editData, reset]);

  const handleDropPhotos = (acceptedFiles) => {
    setPhotos((current) => [...current, ...acceptedFiles]);
    setPhotoError('');
  };

  const handleRemovePhoto = (fileToRemove) => {
    setPhotos((current) => current.filter((file) => file !== fileToRemove));
  };

  const slotsConfigured = Boolean(slots?.operatingHours);

  const validateExtras = () => {
    const hasPhoto = photos.length > 0;
    setPhotoError(hasPhoto ? '' : t('photoRequired'));
    setSlotsError(slotsConfigured ? '' : t('setTimeRequired'));
    return hasPhoto && slotsConfigured;
  };

  const handleFormSubmit = handleSubmit(
    async (data) => {
      if (!validateExtras()) return;

      const photoUrls = [];
      for (const photo of photos) {
        if (typeof photo === 'string') {
          photoUrls.push(photo);
          continue;
        }

        const formData = new FormData();
        formData.append('files', photo);
        const res = await uploadS3(formData).unwrap();
        if (res?.data?.file) photoUrls.push(res.data.file);
      }

      const sameAsBusinessHours = slots?.useSameAsBusinessHours ?? false;

      const payload = {
        name: data.name,
        description: data.description,
        ...(preferredServiceType ? { preferredServiceType } : {}),
        price: Number(data.price),
        category: data.category,
        sameAsBusinessHours,
        ...(sameAsBusinessHours
          ? { sessionSlotMins: Number(slots?.sessionSlotMins || 30), gapBetweenSlotMins: Number(slots?.gapMins || 0) }
          : { slots: convertSlotsToApi(slots) }),
        cancellationPolicy: data.cancellationPolicy,
        photos: photoUrls,
        isAvailable: data.isAvailable,
        status: data.status,
        concurrentClients: Number(data.concurrentClients),
      };

      await onSubmit(payload);
    },
    () => {
      validateExtras();
    }
  );

  return (
    <>
      <Form methods={methods} onSubmit={handleFormSubmit}>
        <Card sx={{ p: 3, maxWidth: 1180, mx: 'auto' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <Box sx={{ mb: 5, pt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                  {t('photos')}
                </Typography>
                <Upload
                  multiple
                  thumbnail
                  accept={{ 'image/*': [] }}
                  value={photos}
                  onDrop={handleDropPhotos}
                  onRemove={handleRemovePhoto}
                  onRemoveAll={() => setPhotos([])}
                  error={!!photoError}
                  helperText={
                    <>
                      {photoError && (
                        <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
                          {photoError}
                        </FormHelperText>
                      )}
                      <Typography
                        variant="caption"
                        sx={{ mt: 2, mx: 'auto', display: 'block', maxWidth: 260, textAlign: 'center', color: 'text.disabled' }}
                      >
                        {t('allowedImageFormats')}
                        <br /> {t('maxSizeOf')} {fData(3145728)}
                      </Typography>
                    </>
                  }
                />
              </Box>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
              >
                <Field.Text name="name" label={t('serviceName')} placeholder={t('serviceNamePlaceholder')} />

                <Field.Text
                  name="description"
                  label={t('description')}
                  placeholder={t('describeServicePlaceholder')}
                  multiline
                  rows={3}
                  inputProps={{ maxLength: 300 }}
                  helperText={`${(descriptionValue || '').length}/300`}
                  sx={{ gridColumn: '1 / -1' }}
                />

                <TextField
                  label={t('serviceType')}
                  value={t('onsite')}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:map-point-bold" width={16} sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'text.primary',
                      fontWeight: 700,
                    },
                  }}
                />

                <ServiceCategoryField
                  name="category"
                  label={t('serviceCategory')}
                  serviceName={nameValue}
                  serviceDescription={descriptionValue}
                />

                <Field.Text name="price" label={t('priceUsdLabel')} placeholder={t('egAmount400')} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />

                <Box sx={{ gridColumn: '1 / -1' }}>
                  <SectionHeader title={t('serviceRules')} />
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  color={slotsError ? 'error' : slotsConfigured ? 'success' : 'inherit'}
                  endIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={() => setSlotsDialogOpen(true)}
                  sx={{
                    py: 1.5,
                    gridColumn: '1 / -1',
                    justifyContent: 'space-between',
                    borderColor: slotsError ? 'error.main' : 'divider',
                    color: slotsError ? 'error.main' : slotsConfigured ? 'success.main' : 'text.primary',
                  }}
                >
                  {slotsConfigured ? t('slotsConfiguredLabel') : t('configureSlots')}
                </Button>
                {slotsError && (
                  <FormHelperText error sx={{ mt: -2, gridColumn: '1 / -1' }}>
                    {slotsError}
                  </FormHelperText>
                )}

                <Field.Text
                  name="concurrentClients"
                  label={t('numberOfConcurrentClients')}
                  placeholder={t('egCount4')}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  sx={{ gridColumn: '1 / -1' }}
                />

                <Box sx={{ gridColumn: '1 / -1' }}>
                  <SectionHeader title={t('cancellationPolicy', { defaultValue: 'Cancellation policy' })} />
                </Box>

                <CancellationPolicyField sx={{ gridColumn: '1 / -1' }} />

                <Field.Select name="status" label={t('status')} sx={{ maxWidth: 200 }}>
                  <MenuItem value="active">{t('active')}</MenuItem>
                  <MenuItem value="inactive">{t('inactive')}</MenuItem>
                </Field.Select>

                <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 3 }}>
                  <Field.Switch
                    name="isAvailable"
                    label={
                      <SwitchLabelWithTooltip
                        label={t('available')}
                        tooltip={t('serviceAvailableTooltip')}
                      />
                    }
                    labelPlacement="start"
                    sx={{ mx: 0, width: 1, maxWidth: 160, justifyContent: 'space-between' }}
                    slotProps={{ switch: { color: 'primary' } }}
                  />
                </Box>
              </Box>

              <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={onCancel}>
                  {t('cancel')}
                </Button>
                <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
                  {isEdit ? t('saveChanges') : t('createService')}
                </LoadingButton>
              </Stack>
            </Grid>
          </Grid>
        </Card>
      </Form>

      <SetSlotsDialog
        open={slotsDialogOpen}
        onClose={() => setSlotsDialogOpen(false)}
        value={slots}
        onChange={(val) => {
          setSlots(val);
          if (val?.operatingHours) setSlotsError('');
        }}
      />
    </>
  );
}
