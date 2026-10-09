import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LoadingButton } from '@mui/lab';

import { Form, Field } from 'src/components/hook-form';
import { Upload } from 'src/components/upload';
import { useTranslate } from 'src/locales/use-locales';
import { useGetPackagesQuery, useGetServicesQuery } from 'src/store/Reducer/services-api';
import { useUploadS3Mutation } from 'src/store/Reducer/auth';
import { fData } from 'src/utils/format-number';

// ----------------------------------------------------------------------

function createPromotionSchema(t) {
  const requiredText = (label) => zod.string().trim().min(1, t('fieldRequired', { field: label }));
  const requiredNumber = (label) =>
    zod.coerce
      .number({ invalid_type_error: t('mustBeANumber', { field: label }) })
      .min(0, t('mustBeAPositiveNumber', { field: label }));
  const requiredInteger = (label) =>
    zod.coerce
      .number({ invalid_type_error: t('mustBeAWholeNumber', { field: label }) })
      .int(t('mustBeAWholeNumber', { field: label }))
      .min(0, t('mustBeAPositiveNumber', { field: label }));

  return zod.object({
    scope: zod.enum(['services', 'packages', 'both']),
    targetServices: zod.array(zod.string()).optional(),
    targetPackages: zod.array(zod.string()).optional(),
    name: requiredText(t('promoNameLabel')),
    description: zod.string().trim().max(300, t('descriptionMaxLength')).optional(),
    promoType: zod.enum(['coupon']),
    promoCode: requiredText(t('promoCodeLabel')),
    discountType: zod.enum(['percentage', 'fixed']),
    discount: requiredNumber(t('discount')),
    totalUsageLimit: requiredInteger(t('totalUsageLimitLabel')),
    perUserLimit: requiredInteger(t('perUserLimitLabel')),
    expiresAt: requiredText(t('expiryDateLabel')),
    status: zod.enum(['active', 'inactive']),
  }).superRefine((values, ctx) => {
    const serviceCount = values.targetServices?.length || 0;
    const packageCount = values.targetPackages?.length || 0;

    if (values.scope === 'services' && serviceCount === 0) {
      ctx.addIssue({ code: zod.ZodIssueCode.custom, path: ['targetServices'], message: t('selectAtLeastOneService') });
    }
    if (values.scope === 'packages' && packageCount === 0) {
      ctx.addIssue({ code: zod.ZodIssueCode.custom, path: ['targetPackages'], message: t('selectAtLeastOnePackage') });
    }
    if (values.scope === 'both' && serviceCount + packageCount === 0) {
      ctx.addIssue({ code: zod.ZodIssueCode.custom, path: ['targetServices'], message: t('selectAtLeastOneServiceOrPackage') });
    }
  });
}

const defaultValues = {
  scope: 'services',
  targetServices: [],
  targetPackages: [],
  name: '',
  description: '',
  promoType: 'coupon',
  promoCode: '',
  discountType: 'percentage',
  discount: '',
  totalUsageLimit: '',
  perUserLimit: '',
  expiresAt: dayjs().format('YYYY-MM-DD'),
  status: 'active',
};

// `targetId` on the API can be a bare id, an array of ids, or an array of populated
// service/package objects (via the `target` field) — normalize all of those to a flat id array.
function normalizeTargetIds(editData) {
  const raw = editData.targetId ?? editData.target;
  if (Array.isArray(raw)) {
    return raw.map((item) => (typeof item === 'string' ? item : item?._id || item?.id)).filter(Boolean);
  }
  if (typeof raw === 'string' && raw) return [raw];
  if (raw?._id || raw?.id) return [raw._id || raw.id];
  return [];
}

function mapEditDataToForm(editData) {
  if (!editData) return defaultValues;

  const scope = editData.scope ?? 'services';
  const targetIds = normalizeTargetIds(editData);

  return {
    scope,
    // For scope "both" this is corrected once the services/packages options finish loading —
    // see the re-split effect below — since we can't tell which ids are which up front.
    targetServices: scope === 'packages' ? [] : targetIds,
    targetPackages: scope === 'packages' ? targetIds : [],
    name: editData.name ?? '',
    description: editData.description ?? '',
    promoType: editData.promoType ?? 'coupon',
    promoCode: editData.promoCode ?? '',
    discountType: editData.discountType ?? 'percentage',
    discount: editData.discount ?? editData.discountValue ?? '',
    totalUsageLimit: editData.totalUsageLimit ?? editData.usageLimit ?? '',
    perUserLimit: editData.perUserLimit ?? '',
    expiresAt: editData.expiresAt ? String(editData.expiresAt).slice(0, 10) : '',
    status: editData.status === 'inactive' ? 'inactive' : 'active',
  };
}

function isUsableImage(url) {
  return Boolean(url && typeof url === 'string' && !url.toLowerCase().includes('noimg') && /^https?:\/\//i.test(url));
}

function getInitialPhotos(editData) {
  if (!editData) return [];
  return (editData.photos || []).filter(isUsableImage);
}

// ----------------------------------------------------------------------

export function PromotionForm({ editData, onSubmit, onCancel }) {
  const { t } = useTranslate();
  const isEdit = Boolean(editData);
  const [photos, setPhotos] = useState(() => getInitialPhotos(editData));

  const [uploadS3] = useUploadS3Mutation();

  const PromotionSchema = useMemo(() => createPromotionSchema(t), [t]);

  const methods = useForm({
    resolver: zodResolver(PromotionSchema),
    defaultValues: mapEditDataToForm(editData),
  });

  const {
    watch,
    trigger,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isSubmitted },
  } = methods;

  const scope = watch('scope');
  const targetsKey = `${scope}|${(watch('targetServices') || []).join(',')}|${(watch('targetPackages') || []).join(',')}`;
  useEffect(() => {
    if (isSubmitted) trigger(['targetServices', 'targetPackages']);
  }, [targetsKey, isSubmitted, trigger]);
  const discountType = watch('discountType');
  const descriptionValue = watch('description');
  const previousScopeRef = useRef(scope);

  const handleDropPhotos = (acceptedFiles) => {
    setPhotos((current) => [...current, ...acceptedFiles]);
  };

  const handleRemovePhoto = (fileToRemove) => {
    setPhotos((current) => current.filter((file) => file !== fileToRemove));
  };

  const showServices = scope === 'services' || scope === 'both';
  const showPackages = scope === 'packages' || scope === 'both';

  const {
    data: servicesData,
    isFetching: servicesFetching,
  } = useGetServicesQuery({ page: 1, limit: 100 }, { skip: !showServices });

  const {
    data: packagesData,
    isFetching: packagesFetching,
  } = useGetPackagesQuery({ page: 1, limit: 100 }, { skip: !showPackages });

  const serviceOptions = useMemo(
    () =>
      (servicesData?.data || [])
        .map((item) => ({ value: item._id || item.id, label: item.name }))
        .filter((item) => item.value && item.label),
    [servicesData?.data]
  );

  const packageOptions = useMemo(
    () =>
      (packagesData?.data || [])
        .map((item) => ({ value: item._id || item.id, label: item.name || item.packageName }))
        .filter((item) => item.value && item.label),
    [packagesData?.data]
  );

  useEffect(() => {
    if (previousScopeRef.current !== scope) {
      setValue('targetServices', []);
      setValue('targetPackages', []);
      previousScopeRef.current = scope;
    }
  }, [scope, setValue]);

  // Edit mode + scope "both": we couldn't tell which ids were services vs packages until both
  // option lists finished loading — re-split the combined id list against them once they have.
  useEffect(() => {
    if (!editData || editData.scope !== 'both') return;
    if (!serviceOptions.length && !packageOptions.length) return;

    const targetIds = normalizeTargetIds(editData);
    setValue('targetServices', targetIds.filter((id) => serviceOptions.some((option) => option.value === id)));
    setValue('targetPackages', targetIds.filter((id) => packageOptions.some((option) => option.value === id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData, serviceOptions, packageOptions]);

  const handleFormSubmit = handleSubmit(async (data) => {
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

    const targetId =
      data.scope === 'services'
        ? data.targetServices || []
        : data.scope === 'packages'
          ? data.targetPackages || []
          : [...(data.targetServices || []), ...(data.targetPackages || [])];

    await onSubmit({
      _id: editData?._id,
      name: data.name,
      description: data.description,
      promoType: data.promoType,
      promoCode: data.promoCode,
      discountType: data.discountType,
      discount: data.discount,
      totalUsageLimit: data.totalUsageLimit,
      perUserLimit: data.perUserLimit,
      expiresAt: data.expiresAt ? dayjs(data.expiresAt).format('YYYY-MM-DD') : data.expiresAt,
      status: data.status,
      scope: data.scope,
      targetId,
      photos: photoUrls.length ? photoUrls : ['noimg.png'],
    });
  });

  return (
    <Form methods={methods} onSubmit={handleFormSubmit}>
      <Card sx={{ p: 3, maxWidth: 1180, mx: 'auto' }}>
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
                <br /> {t('maxSizeOf')} {fData(3145728)}
              </Typography>
            }
          />
        </Box>

        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          <Field.Select name="scope" label={t('applyPromotionTo')}>
            <MenuItem value="services">{t('service')}</MenuItem>
            <MenuItem value="packages">{t('package')}</MenuItem>
            <MenuItem value="both">{t('both')}</MenuItem>
          </Field.Select>

          {showServices && (
            <Field.MultiSelect
              checkbox
              chip
              fullWidth
              name="targetServices"
              label={t('services')}
              helperText={servicesFetching ? t('loading') : undefined}
              options={serviceOptions}
              disabled={servicesFetching}
              sx={{ gridColumn: scope === 'both' ? '1 / -1' : 'auto' }}
            />
          )}

          {showPackages && (
            <Field.MultiSelect
              checkbox
              chip
              fullWidth
              name="targetPackages"
              label={t('packages')}
              helperText={packagesFetching ? t('loading') : undefined}
              options={packageOptions}
              disabled={packagesFetching}
              sx={{ gridColumn: scope === 'both' ? '1 / -1' : 'auto' }}
            />
          )}

          <Field.Text name="name" label={t('promoNameLabel')} placeholder={t('egSummerDiscount')} />

          <Field.Text
            name="description"
            label={t('description')}
            placeholder={t('describePromotionPlaceholder')}
            multiline
            rows={3}
            inputProps={{ maxLength: 300 }}
            helperText={`${(descriptionValue || '').length}/300`}
            sx={{ gridColumn: '1 / -1' }}
          />

          <Field.Select name="promoType" label={t('promoTypeLabel')}>
            <MenuItem value="coupon">{t('coupon')}</MenuItem>
          </Field.Select>

          <Field.Text name="promoCode" label={t('promoCodeLabel')} placeholder={t('egSummer20')} />

          <Field.Select name="discountType" label={t('discountTypeLabel')}>
            <MenuItem value="percentage">{t('percentage')}</MenuItem>
            <MenuItem value="fixed">{t('fixedAmount')}</MenuItem>
          </Field.Select>

          <Field.Text
            name="discount"
            label={discountType === 'percentage' ? t('percentageLabel') : t('fixedAmount')}
            placeholder={discountType === 'percentage' ? t('egTwenty') : t('egHundred')}
            type="number"
            inputProps={{ inputMode: 'decimal', min: 0, step: discountType === 'percentage' ? 1 : 0.01 }}
          />

          <Field.Text name="totalUsageLimit" label={t('totalUsageLimitLabel')} placeholder={t('egTenPeriod')} type="number" inputProps={{ inputMode: 'numeric', min: 0, step: 1 }} />

          <Field.Text name="perUserLimit" label={t('perUserLimitLabel')} placeholder={t('egOne')} type="number" inputProps={{ inputMode: 'numeric', min: 0, step: 1 }} />

          <Field.DatePicker name="expiresAt" label={t('expiryDateLabel')} disablePast />

          <Field.Select name="status" label={t('status')}>
            <MenuItem value="active">{t('active')}</MenuItem>
            <MenuItem value="inactive">{t('inactive')}</MenuItem>
          </Field.Select>
        </Box>

        <Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={onCancel}>
              {t('cancel')}
            </Button>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              {isEdit ? t('saveChanges') : t('createPromotion')}
            </LoadingButton>
          </Stack>
        </Grid>
      </Card>
    </Form>
  );
}
