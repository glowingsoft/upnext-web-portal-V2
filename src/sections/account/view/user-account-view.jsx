import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';

import { AccountChangePassword } from '../account-change-password';
import { AccountGeneral } from '../account-general';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'general', label: 'General', icon: <Iconify icon="solar:user-id-bold" width={24} /> },
  { value: 'changePassword', label: 'Change Password', icon: <Iconify icon="ic:round-vpn-key" width={24} /> },
];

// ----------------------------------------------------------------------

export function AccountView() {
  const tabs = useTabs('general');

  return (
    <DashboardContent>
      <CustomBreadcrumbs heading="Account" links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Profile' }]} sx={{ mb: { xs: 3, md: 5 } }} />

      <Tabs value={tabs.value} onChange={tabs.onChange} sx={{ mb: { xs: 3, md: 5 } }}>
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {tabs.value === 'general' && <AccountGeneral />}
      {tabs.value === 'changePassword' && <AccountChangePassword />}
    </DashboardContent>
  );
}
