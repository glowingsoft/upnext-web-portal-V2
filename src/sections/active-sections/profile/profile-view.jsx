import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';

import ProviderProfileView from './provider-profile/provider-profile-view';
import CustomerProfileView from './customer-profile/customer-profile-view';
import AdminProfileView from './admin-profile/admin-profile-view';
import { useSelector } from 'react-redux';
import { AccountChangePassword } from 'src/sections/account/account-change-password';
import { AccountDeleteAccount } from 'src/sections/account/account-delete-account';

// ----------------------------------------------------------------------

// Tabs will be set dynamically based on user type

// ----------------------------------------------------------------------

export function ProfileView() {
  const { t } = useTranslate();
  const { user } = useSelector((state) => state.user);
  const userType = user?.accountState?.userType;
  const isCustomer = userType === 'customer' || userType === 'user';
  const isProvider = userType === 'provider' || userType === 'business';
  const isAdmin = userType === 'admin' || userType === 'subadmin';
  const tabs = useTabs('general');
  const dashboardRoot = isAdmin ? paths.adminDashboard.root : paths.dashboard.root;
  const GeneralProfileView = isCustomer ? CustomerProfileView : isAdmin ? AdminProfileView : ProviderProfileView;
  const canDeleteAccount = isCustomer || isProvider;


  // Tabs and content based on user type
  const TABS = [
    { value: 'general', label: t('overview'), icon: <Iconify icon="solar:user-id-bold" width={24} /> },
    { value: 'changePassword', label: t('updatePassword'), icon: <Iconify icon="ic:round-vpn-key" width={24} /> },
    ...(canDeleteAccount ? [{ value: 'deleteAccount', label: t('deleteAccount'), icon: <Iconify icon="solar:danger-triangle-bold" width={24} /> }] : []),
  ];

  return (
    <DashboardContent>
      <CustomBreadcrumbs heading={t('profile')} links={[{ name: t('dashboard'), href: dashboardRoot }, { name: t('profile') }]} sx={{ mb: { xs: 3, md: 5 } }} />

      <Tabs value={tabs.value} onChange={tabs.onChange} sx={{ mb: { xs: 3, md: 5 } }}>
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {tabs.value === 'general' && <GeneralProfileView />}
      {tabs.value === 'changePassword' && <AccountChangePassword />}
      {tabs.value === 'deleteAccount' && canDeleteAccount && <AccountDeleteAccount />}
    </DashboardContent>
  );
}
