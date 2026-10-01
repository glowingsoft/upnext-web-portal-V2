import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { LoadingButton } from '@mui/lab';

import { Form, Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { useGetServicesQuery } from 'src/store/Reducer/services-api';
import { useGetBadgesQuery } from 'src/store/Reducer/badges-api';
import { useUploadS3Mutation } from 'src/store/Reducer/auth';
import { findOnsitePreferredServiceType } from 'src/utils/preferred-service-type';
import { useTranslate } from 'src/locales/use-locales';
import { fData } from 'src/utils/format-number';

import { ServiceCategoryField } from 'src/sections/active-sections/services-view/components/service-category-field';
import { SetSlotsDialog } from './set-slots-dialog';

// ----------------------------------------------------------------------

function createPackageSchema(t) {
  const requiredText = (field) => zod.string().trim().min(1, t('fieldRequired', { field }));

  return zod.object({
    packageName: requiredText(t('packageName')),
    description: zod.string().trim().max(300, t('descriptionMaxLength')).optional(),
    category: requiredText(t('serviceCategory')),
    services: zod.array(zod.string()).min(1, t('selectAtLeastOneService')),
    actualPrice: zod.string().optional(),
    price: requiredText(t('packagePrice')),
    concurrentClients: requiredText(t('numberOfConcurrentClients')),
    latestBookHours: requiredText(t('bookingHoursField')),
    latestBookMins: requiredText(t('bookingMinutesField')),
    latestCancelHours: requiredText(t('cancellationHoursField')),
    latestCancelMins: requiredText(t('cancellationMinutesField')),
    refundPercentage: requiredText(t('refundPercentageLabel')),
    refundRules: requiredText(t('rulesForRefund')),
    autoAccept: zod.boolean(),
    isAvailable: zod.boolean(),
    status: zod.enum(['active', 'inactive']),
  });
}

const defaultValues = {
  packageName: '',
  description: '',
  category: '',
  services: [],
  actualPrice: '',
  price: '',
  concurrentClients: '',
  latestBookHours: '',
  latestBookMins: '',
  latestCancelHours: '',
  latestCancelMins: '',
  refundPercentage: '',
  refundRules: '',
  autoAccept: false,
  isAvailable: true,
  status: 'active',
};

// ----------------------------------------------------------------------

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
    packageName: raw.name ?? raw.packageName ?? '',
    description: raw.description ?? '',
    category: raw.category?._id ?? (typeof raw.category === 'string' ? raw.category : ''),
    services: (raw.services || []).map((s) => (typeof s === 'string' ? s : s._id)),
    actualPrice: raw.actualPrice != null ? String(raw.actualPrice) : '',
    price: raw.price != null ? String(raw.price) : '',
    concurrentClients: raw.concurrentClients != null ? String(raw.concurrentClients) : '',
    latestBookHours: raw.howLateCanBook?.hours != null ? String(raw.howLateCanBook.hours) : '0',
    latestBookMins: raw.howLateCanBook?.mins != null ? String(raw.howLateCanBook.mins) : '0',
    latestCancelHours: raw.howLateCanCancel?.hours != null ? String(raw.howLateCanCancel.hours) : '0',
    latestCancelMins: raw.howLateCanCancel?.mins != null ? String(raw.howLateCanCancel.mins) : '0',
    refundPercentage: raw.refundPercentage != null ? String(raw.refundPercentage) : '',
    refundRules: raw.refundRules ?? '',
    autoAccept: Boolean(raw.autoSelect),
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

// ----------------------------------------------------------------------

export function PackageForm({ editData, onSubmit, onCancel }) {
  const { t } = useTranslate();
  const isEdit = Boolean(editData);
  const [slotsDialogOpen, setSlotsDialogOpen] = useState(false);
  const [slots, setSlots] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [slotsError, setSlotsError] = useState('');

  const [uploadS3] = useUploadS3Mutation();

  const { data: badgesData } = useGetBadgesQuery({});
  const allBadges = Array.isArray(badgesData?.data)
    ? badgesData.data
    : (badgesData?.data?.docs ?? badgesData?.data?.data ?? []);
  const preferredServiceType = findOnsitePreferredServiceType(allBadges);

  const { data: servicesData, isLoading: servicesLoading } = useGetServicesQuery({ limit: 100 });
  const serviceOptions = (
    servicesData?.data?.docs ||
    servicesData?.data?.data ||
    (Array.isArray(servicesData?.data) ? servicesData.data : [])
  ).map((svc) => ({
    value: svc._id,
    label: svc.name || svc.serviceName || svc._id,
    price: Number(svc.price ?? 0),
  }));

  const PackageSchema = useMemo(() => createPackageSchema(t), [t]);

  const methods = useForm({
    resolver: zodResolver(PackageSchema),
    defaultValues,
  });

  const { reset, watch, setValue, handleSubmit, formState: { isSubmitting } } = methods;

  const selectedServiceIds = watch('services') || [];
  const packageNameValue = watch('packageName');
  const descriptionValue = watch('description');

  // Auto-calculate actual price from selected services
  useEffect(() => {
    const total = selectedServiceIds.reduce((sum, id) => {
      const svc = serviceOptions.find((s) => s.value === id);
      return sum + (svc?.price ?? 0);
    }, 0);
    setValue('actualPrice', total ? String(total) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServiceIds.join(','), serviceOptions.length, setValue]);

  // Pre-populate on edit
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
    setSlotsError('');
  }, [editData, reset]);

  const slotsConfigured = Boolean(slots?.operatingHours);

  const handleDropPhotos = (acceptedFiles) => {
    setPhotos((current) => [...current, ...acceptedFiles]);
  };

  const handleRemovePhoto = (fileToRemove) => {
    setPhotos((current) => current.filter((file) => file !== fileToRemove));
  };

  const handleFormSubmit = handleSubmit(
    async (data) => {
      if (!slotsConfigured) {
        setSlotsError(t('configureSlotsRequired'));
        return;
      }

      const photoUrls = [];
      for (const photo of photos) {
        if (typeof photo === 'string') {
          photoUrls.push(photo);
          continue;
        }

        try {
          const formData = new FormData();
          formData.append('files', photo);
          const res = await uploadS3(formData).unwrap();
          if (res?.data?.file) photoUrls.push(res.data.file);
        } catch {
          // Skip files that failed to upload rather than failing the whole submission.
        }
      }

      const sameAsBusinessHours = slots?.useSameAsBusinessHours ?? false;

      const payload = {
        name: data.packageName,
        description: data.description,
        ...(preferredServiceType ? { preferredServiceType } : {}),
        price: Number(data.price),
        category: data.category,
        services: data.services,
        sameAsBusinessHours,
        ...(sameAsBusinessHours
          ? { sessionSlotMins: Number(slots?.sessionSlotMins || 30), gapBetweenSlotMins: Number(slots?.gapMins || 0) }
          : { slots: convertSlotsToApi(slots) }),
        howLateCanBook: { hours: Number(data.latestBookHours), mins: Number(data.latestBookMins) },
        howLateCanCancel: { hours: Number(data.latestCancelHours), mins: Number(data.latestCancelMins) },
        refundPercentage: Number(data.refundPercentage),
        refundRules: data.refundRules,
        photos: photoUrls,
        coverImage: photoUrls[0] || '',
        isAvailable: data.isAvailable,
        status: data.status,
        concurrentClients: Number(data.concurrentClients),
        autoSelect: data.autoAccept,
      };

      await onSubmit(payload);
    },
    () => {
      if (!slotsConfigured) setSlotsError(t('configureSlotsRequired'));
    }
  );

  return (
    <>
      <Form methods={methods} onSubmit={handleFormSubmit}>
        <Card sx={{ p: 3, maxWidth: 1180, mx: 'auto' }}>
          {/* Photos */}
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
              helperText={
                <Typography
                  variant="caption"
                  sx={{ mt: 2, mx: 'auto', display: 'block', maxWidth: 260, textAlign: 'center', color: 'text.disabled' }}
                >
                  {t('allowedImageFormats')}
                  <br /> {t('maxSizeOf')} {fData(3145728)}{t('firstPhotoUsedAsDisplayImage')}
                </Typography>
              }
            />
          </Box>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            {/* Package Name */}
            <Field.Text name="packageName" label={t('packageName')} placeholder={t('packageNamePlaceholder')} />

            {/* Description */}
            <Field.Text
              name="description"
              label={t('description')}
              placeholder={t('describePackagePlaceholder')}
              multiline
              rows={3}
              inputProps={{ maxLength: 300 }}
              helperText={`${(descriptionValue || '').length}/300`}
              sx={{ gridColumn: '1 / -1' }}
            />

            {/* Service Type — always onsite, non-editable */}
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

            {/* Category */}
            <ServiceCategoryField
              name="category"
              label={t('serviceCategory')}
              serviceName={packageNameValue}
              serviceDescription={descriptionValue}
            />

            {/* Services multi-select */}
            <Field.MultiSelect
              checkbox
              chip
              fullWidth
              name="services"
              label={t('services')}
              options={serviceOptions}
              disabled={servicesLoading}
            />

            {/* Actual price (auto-calculated, read-only) */}
            <Tooltip title={t('actualPriceSumTooltip')} arrow>
              <span>
                <Field.Text
                  name="actualPrice"
                  label={t('actualPriceSumLabel')}
                  disabled
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </span>
            </Tooltip>

            {/* Package price */}
            <Field.Text
              name="price"
              label={t('packagePriceLabel')}
              placeholder={t('egPackagePrice')}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            {/* Slots */}
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
              <FormHelperText error sx={{ gridColumn: '1 / -1', mt: -2 }}>
                {slotsError}
              </FormHelperText>
            )}

            {/* Concurrent clients */}
            <Field.Text
              name="concurrentClients"
              label={t('numberOfConcurrentClients')}
              placeholder={t('egTenPeriod')}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              sx={{ gridColumn: '1 / -1' }}
            />

            {/* How late can book */}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <SectionHeader title={t('howLateCanSomeoneBook')} />
            </Box>
            <Field.Text name="latestBookHours" label={t('hours')} placeholder={t('egTenPeriod')} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />
            <Field.Text name="latestBookMins" label={t('mins')} placeholder={t('egThirtyPeriod')} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />

            {/* How late can cancel */}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <SectionHeader title={t('howLateCanSomeoneCancel')} />
            </Box>
            <Field.Text name="latestCancelHours" label={t('hours')} placeholder={t('egTenPeriod')} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />
            <Field.Text name="latestCancelMins" label={t('mins')} placeholder={t('egThirtyPeriod')} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />

            {/* Refund */}
            <Field.Text
              name="refundPercentage"
              label={t('refundPercentageLabel')}
              placeholder={t('egTenPeriod')}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0, max: 100 }}
              sx={{ gridColumn: '1 / -1' }}
            />
            <Field.Text
              name="refundRules"
              label={t('rulesForRefund')}
              placeholder={t('egRefundRulesPackage')}
              multiline
              rows={3}
              sx={{ gridColumn: '1 / -1' }}
            />

            {/* Status */}
            <Field.Select name="status" label={t('status')} sx={{ maxWidth: 200 }}>
              <MenuItem value="active">{t('active')}</MenuItem>
              <MenuItem value="inactive">{t('inactive')}</MenuItem>
            </Field.Select>

            <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 3 }}>
              {/* Available */}
              <Field.Switch
                name="isAvailable"
                label={t('available')}
                labelPlacement="start"
                sx={{ mx: 0, width: 1, maxWidth: 160, justifyContent: 'space-between' }}
              />

              {/* Auto Accept */}
              <Field.Switch
                name="autoAccept"
                label={t('autoAccept')}
                labelPlacement="start"
                sx={{ mx: 0, width: 1, maxWidth: 160, justifyContent: 'space-between' }}
              />
            </Box>
          </Box>

          <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={onCancel}>
              {t('cancel')}
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              loadingIndicator={<CircularProgress size={18} color="inherit" />}
            >
              {isEdit ? t('saveChanges') : t('createPackage')}
            </LoadingButton>
          </Stack>
        </Card>
      </Form>

      <SetSlotsDialog
        open={slotsDialogOpen}
        onClose={() => setSlotsDialogOpen(false)}
        value={slots}
        onChange={(value) => {
          setSlots(value);
          if (value?.operatingHours) setSlotsError('');
        }}
      />
    </>
  );
}
