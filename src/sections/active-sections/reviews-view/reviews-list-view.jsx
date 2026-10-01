import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';

import { ReviewsListContent } from './reviews-list-content';

// ----------------------------------------------------------------------

export function ReviewsListView() {
  const { t } = useTranslate();

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={t('manageReviews')}
        links={[{ name: t('dashboard'), href: paths.adminDashboard.root }, { name: t('manageReviews') }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <ReviewsListContent />
    </DashboardContent>
  );
}
