import { useSelector } from 'react-redux';

import { ProviderDashboardView } from './provider-dashboard-view';
import { CustomerDashboardView } from './customer-dashboard-view';
import { AdminDashboardView } from './admin-dashboard-view';

// ----------------------------------------------------------------------

export function OverviewAppView() {
  const { user } = useSelector((state) => state.user);
  return (
    <>
      {(user?.accountState?.userType === 'customer' || user?.accountState?.userType === 'user') && <CustomerDashboardView />}
      {(user?.accountState?.userType === 'provider' || user?.accountState?.userType === 'business') && <ProviderDashboardView />}
      {(user?.accountState?.userType === 'admin' || user?.accountState?.userType === 'subadmin') && <AdminDashboardView />}
    </>
  );
}
