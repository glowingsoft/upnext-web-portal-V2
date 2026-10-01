import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';
import { useSelector } from 'react-redux';
import { DashboardContent } from 'src/layouts/dashboard';

import { BookingsListContent } from './bookings-list-content';

// ----------------------------------------------------------------------

export function SessionsListView() {
  const { t } = useTranslate();
  const userState = useSelector((state) => state.user);
  const userType = userState?.user?.accountState?.userType ?? userState?.accountState?.userType;
  const isAdmin = userType === 'admin';
  const dashboardPath = isAdmin ? paths.adminDashboard.root : paths.dashboard.root;

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={t('bookings')}
        links={[{ name: t('dashboard'), href: dashboardPath }, { name: t('bookings') }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <BookingsListContent />
    </DashboardContent>
  );
}
