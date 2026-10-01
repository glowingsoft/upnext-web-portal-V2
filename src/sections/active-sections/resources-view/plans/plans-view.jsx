import { useState } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';

import { MealTab } from './meal/meal-tab';
import { SupplementTab } from './supplement/supplement-tab';
import { TrainingTab } from './training/training-tab';

// ----------------------------------------------------------------------

const PLAN_TABS = [
  { value: 'training', label: 'Training Plans', icon: 'solar:dumbbell-bold-duotone' },
  { value: 'meal', label: 'Meal Plans', icon: 'solar:bowl-spoon-bold-duotone' },
  { value: 'supplement', label: 'Supplement Plans', icon: 'solar:pill-bold-duotone' },
];

// ----------------------------------------------------------------------

export default function PlansView() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('plans-active-tab') || 'training');

  const handleTabChange = (_, val) => {
    setActiveTab(val);
    localStorage.setItem('plans-active-tab', val);
  };

  return (
    <DashboardContent maxWidth="lg">
      <CustomBreadcrumbs heading="Plans" links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Resources' }, { name: 'Plans' }]} sx={{ mb: { xs: 3, md: 5 } }} />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {PLAN_TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} sx={{ minHeight: 48 }} />
        ))}
      </Tabs>

      {/* Tab Content */}
      {activeTab === 'training' && <TrainingTab />}

      {activeTab === 'meal' && <MealTab />}

      {activeTab === 'supplement' && <SupplementTab />}
    </DashboardContent>
  );
}
