import { useLocation, useParams } from 'react-router-dom';

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
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';

import {
  useCreatePackageMutation,
  useGetPackageByIdQuery,
  useUpdatePackageMutation,
} from 'src/store/Reducer/services-api';

import { PackageForm } from './components/package-form';

// ----------------------------------------------------------------------

function PackageFormSkeleton() {
  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="rounded" width={80} height={34} sx={{ borderRadius: 1 }} />
      </Box>
      <Box sx={{ mb: { xs: 3, md: 5 } }}>
        <Skeleton variant="text" width={200} height={36} sx={{ mb: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="text" width={80} height={20} />
          <Skeleton variant="text" width={8} height={20} />
          <Skeleton variant="text" width={70} height={20} />
          <Skeleton variant="text" width={8} height={20} />
          <Skeleton variant="text" width={110} height={20} />
        </Stack>
      </Box>
      <Card sx={{ p: 3, maxWidth: 1180, mx: 'auto', width: '100%' }}>
        <Skeleton variant="text" width={70} height={24} sx={{ mb: 1.5 }} />
        <Skeleton variant="rounded" height={160} sx={{ borderRadius: 1, mb: 2 }} />
        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
          <Skeleton variant="rounded" width={80} height={80} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={80} height={80} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={80} height={80} sx={{ borderRadius: 1 }} />
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
          {/* Package Name / Service Type */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* Description — full width */}
          <Skeleton variant="rounded" height={100} sx={{ gridColumn: '1 / -1', borderRadius: 1 }} />

          {/* Category / Services */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* Actual Price / Package Price */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* SERVICE RULES header */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Skeleton variant="text" width={120} height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="rectangular" height={1} />
          </Box>

          {/* Configure Slots button */}
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
          <Skeleton variant="rounded" height={90} sx={{ gridColumn: '1 / -1', borderRadius: 1 }} />

          {/* Status */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1, maxWidth: 200 }} />

          {/* Available / Auto Accept switches */}
          <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 3 }}>
            <Skeleton variant="rounded" width={160} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={160} height={36} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
          <Skeleton variant="rounded" width={90} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={140} height={40} sx={{ borderRadius: 1 }} />
        </Stack>
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function PackageAddEditFormView() {
  const { t } = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useLocation();
  const { id } = useParams();

  const isAdminRoute = pathname.includes('/admin-dashboard');
  const dashboardRoot = isAdminRoute ? paths.adminDashboard.root : paths.dashboard.root;
  const packagesPath = paths.dashboard.packages;

  const isNew = pathname.endsWith('/new');
  const isEdit = !isNew && Boolean(id);
  const packageFromRoute = state?.packageData;
  const hasRoutePackage = packageFromRoute?._id === id;

  const { data: packageData, isLoading: packageLoading } = useGetPackageByIdQuery(id, {
    skip: !isEdit || hasRoutePackage,
  });
  const existingPackage = hasRoutePackage ? packageFromRoute : packageData?.data ?? null;

  const [createPackage] = useCreatePackageMutation();
  const [updatePackage] = useUpdatePackageMutation();

  const heading = isEdit ? t('editPackage') : t('createNewPackage');
  const currentPageLabel = isEdit ? (existingPackage?.name || existingPackage?.packageName || t('editPackage')) : t('newPackage');

  const handleClose = () => router.push(packagesPath);

  const handleSubmit = async (payload) => {
    try {
      if (isEdit) {
        await updatePackage({ id, ...payload }).unwrap();
        toast.success(t('packageUpdatedSuccess'));
      } else {
        await createPackage(payload).unwrap();
        toast.success(t('packageCreatedSuccess'));
      }
      router.push(packagesPath);
    } catch (err) {
      toast.error(err?.data?.message || t('somethingWentWrong'));
    }
  };

  if (isEdit && packageLoading) {
    return <PackageFormSkeleton />;
  }

  if (isEdit && !existingPackage) {
    return (
      <DashboardContent>
        <Alert severity="warning">{t('packageNotFound')}</Alert>
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
        links={[{ name: t('dashboard'), href: dashboardRoot }, { name: t('packages'), href: packagesPath }, { name: currentPageLabel }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PackageForm editData={isEdit ? existingPackage : null} onSubmit={handleSubmit} onCancel={handleClose} />
    </DashboardContent>
  );
}
