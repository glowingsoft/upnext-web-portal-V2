import { useParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import { paths } from 'src/routes/paths';
import { usePathname, useRouter } from 'src/routes/hooks';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';
import {
  useCreatePromotionMutation,
  useGetPromotionByIdQuery,
  useUpdatePromotionMutation,
} from 'src/store/Reducer/services-api';

import { PromotionForm } from './components/promotion-form';

// ----------------------------------------------------------------------

function PromotionFormSkeleton() {
  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <Box sx={{ mb: { xs: 3, md: 5 } }}>
        <Skeleton variant="text" width={180} height={36} sx={{ mb: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="text" width={80} height={20} />
          <Skeleton variant="text" width={8} height={20} />
          <Skeleton variant="text" width={80} height={20} />
          <Skeleton variant="text" width={8} height={20} />
          <Skeleton variant="text" width={100} height={20} />
        </Stack>
      </Box>

      <Card sx={{ p: 3, maxWidth: 1180, mx: 'auto', width: '100%' }}>
        {/* Photos upload */}
        <Box sx={{ mb: 5, pt: 1 }}>
          <Skeleton variant="text" width={70} height={24} sx={{ mb: 1.5 }} />
          <Skeleton variant="rounded" height={160} sx={{ borderRadius: 1, mb: 2 }} />
          <Stack direction="row" spacing={1.5}>
            <Skeleton variant="rounded" width={80} height={80} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={80} height={80} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={80} height={80} sx={{ borderRadius: 1 }} />
          </Stack>
        </Box>

        {/* Fields */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 3,
          }}
        >
          {/* Apply Promotion To / Services */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* Promo Name */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* Description — full width */}
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: 1, gridColumn: '1 / -1' }} />

          {/* Promo Type / Promo Code */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* Discount Type / Discount Value */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* Total Usage Limit / Per User Limit */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* Expiry Date / Status */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
        </Box>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
          <Skeleton variant="rounded" width={90} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={140} height={40} sx={{ borderRadius: 1 }} />
        </Stack>
      </Card>
    </DashboardContent>
  );
}

export function PromotionAddEditFormView() {
  const { t } = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const { id } = useParams();

  const isAdminRoute = pathname.includes('/admin-dashboard');
  const dashboardRoot = isAdminRoute ? paths.adminDashboard.root : paths.dashboard.root;
  const promotionsPath = paths.dashboard.promotions;

  const isNew = pathname.endsWith('/new');
  const isEdit = !isNew && Boolean(id);

  const { data: promotionData, isLoading: promotionLoading } = useGetPromotionByIdQuery(id, { skip: !isEdit });
  const promotion = promotionData?.data ?? null;

  const [createPromotion] = useCreatePromotionMutation();
  const [updatePromotion] = useUpdatePromotionMutation();

  const heading = isEdit ? t('editPromotion') : t('createNewPromotion');
  const currentPageLabel = isEdit ? promotion?.name : t('newPromotion');

  const handleClose = () => {
    router.push(promotionsPath);
  };

  const handleSubmit = async (data) => {
    try {
      if (isEdit) {
        await updatePromotion({ id, ...data }).unwrap();
        toast.success(t('promotionUpdatedSuccess'));
      } else {
        await createPromotion(data).unwrap();
        toast.success(t('promotionCreatedSuccess'));
      }
      router.push(promotionsPath);
    } catch (err) {
      toast.error(err?.data?.message || t('failedToSavePromotion'));
    }
  };

  if (isEdit && promotionLoading) {
    return <PromotionFormSkeleton />;
  }

  if (isEdit && !promotion) {
    return (
      <DashboardContent>
        <Alert severity="warning">{t('promotionNotFound')}</Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={heading}
        links={[{ name: t('dashboard'), href: dashboardRoot }, { name: t('promotions'), href: promotionsPath }, { name: currentPageLabel }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PromotionForm editData={isEdit ? promotion : null} onSubmit={handleSubmit} onCancel={handleClose} />
    </DashboardContent>
  );
}
