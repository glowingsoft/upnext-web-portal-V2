import { useParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import { paths } from 'src/routes/paths';
import { usePathname, useRouter } from 'src/routes/hooks';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { toast } from 'src/components/snackbar';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { useCreateServiceMutation, useGetServiceByIdQuery, useUpdateServiceMutation } from 'src/store/Reducer/services-api';
import { ServiceForm } from './components/service-form';

// ----------------------------------------------------------------------

function ServiceFormSkeleton() {
  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      {/* Back button skeleton */}
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="rounded" width={80} height={34} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Breadcrumbs skeleton */}
      <Box sx={{ mb: { xs: 3, md: 5 } }}>
        <Skeleton variant="text" width={180} height={36} sx={{ mb: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="text" width={80} height={20} />
          <Skeleton variant="text" width={8} height={20} />
          <Skeleton variant="text" width={60} height={20} />
          <Skeleton variant="text" width={8} height={20} />
          <Skeleton variant="text" width={100} height={20} />
        </Stack>
      </Box>

      <Card sx={{ p: 3, maxWidth: 1180, mx: 'auto', width: '100%' }}>
        {/* Photos upload skeleton */}
        <Box sx={{ mb: 5, pt: 1 }}>
          <Skeleton variant="text" width={70} height={24} sx={{ mb: 1.5 }} />
          <Skeleton variant="rounded" height={160} sx={{ borderRadius: 1, mb: 2 }} />
          <Stack direction="row" spacing={1.5}>
            <Skeleton variant="rounded" width={80} height={80} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={80} height={80} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={80} height={80} sx={{ borderRadius: 1 }} />
          </Stack>
        </Box>

        {/* 2-column grid fields */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 3,
          }}
        >
          {/* Row 1: Service Name | Service Type */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* Row 2: Category | Price */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* SERVICE RULES header */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Skeleton variant="text" width={120} height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="rectangular" height={1} />
          </Box>

          {/* Slots button */}
          <Skeleton variant="rounded" height={48} sx={{ gridColumn: '1 / -1', borderRadius: 1 }} />

          {/* Concurrent Clients */}
          <Skeleton variant="rounded" height={56} sx={{ gridColumn: '1 / -1', borderRadius: 1 }} />

          {/* HOW LATE CAN SOMEONE BOOK */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Skeleton variant="text" width={200} height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="rectangular" height={1} />
          </Box>
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* HOW LATE CAN SOMEONE CANCEL */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Skeleton variant="text" width={220} height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="rectangular" height={1} />
          </Box>
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* Refund % */}
          <Skeleton variant="rounded" height={56} sx={{ gridColumn: '1 / -1', borderRadius: 1 }} />

          {/* Rules for Refund */}
          <Skeleton variant="rounded" height={100} sx={{ gridColumn: '1 / -1', borderRadius: 1 }} />

          {/* Switches */}
          <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 3 }}>
            <Skeleton variant="rounded" width={160} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={160} height={36} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>

        {/* Action buttons */}
        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
          <Skeleton variant="rounded" width={90} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={130} height={40} sx={{ borderRadius: 1 }} />
        </Stack>
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function ServiceAddEditFormView() {
  const { t } = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const { id } = useParams();

  const isAdminRoute = pathname.includes('/admin-dashboard');
  const dashboardRoot = isAdminRoute ? paths.adminDashboard.root : paths.dashboard.root;
  const servicesPath = paths.dashboard.services;

  const isNew = pathname.endsWith('/new');
  const isEdit = !isNew && Boolean(id);

  const { data: serviceData, isLoading: serviceLoading } = useGetServiceByIdQuery(id, { skip: !isEdit });
  const existingService = serviceData?.data ?? null;

  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();

  const heading = isEdit ? t('editService') : t('createNewService');
  const currentPageLabel = isEdit ? (existingService?.name || t('editService')) : t('newService');

  const handleClose = () => {
    router.push(servicesPath);
  };

  const handleSubmit = async (payload) => {
    try {
      if (isEdit) {
        await updateService({ id, ...payload }).unwrap();
        toast.success(t('serviceUpdatedSuccess'));
      } else {
        await createService(payload).unwrap();
        toast.success(t('serviceCreatedSuccess'));
      }
      router.push(servicesPath);
    } catch (err) {
      toast.error(err?.data?.message || t('somethingWentWrong'));
    }
  };

  if (isEdit && serviceLoading) {
    return <ServiceFormSkeleton />;
  }

  if (isEdit && !existingService) {
    return (
      <DashboardContent>
        <Alert severity="warning">{t('serviceNotFound')}</Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<Iconify width={16} height={16} icon="solar:alt-arrow-left-linear" />}
          onClick={() => router.back()}
          sx={{ color: 'text.primary', fontWeight: 800 }}
        >
          {t('back')}
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={heading}
        links={[{ name: t('dashboard'), href: dashboardRoot }, { name: t('services'), href: servicesPath }, { name: currentPageLabel }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ServiceForm editData={isEdit ? existingService : null} onSubmit={handleSubmit} onCancel={handleClose} />
    </DashboardContent>
  );
}
