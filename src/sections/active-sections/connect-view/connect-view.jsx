import { useEffect, useMemo, useState } from 'react';

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';

import { PROVIDER_CONNECTIONS } from './connect-data';
import { ConnectConnectionsView } from './connect-connections-view';

// ----------------------------------------------------------------------

export default function ConnectView() {
  const { t } = useTranslate();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.user);
  const userType = user?.accountState?.userType;

  const [schedulingUrl, setSchedulingUrl] = useState('');
  const [connectSearchValue, setConnectSearchValue] = useState('');

  const isCustomer = userType === 'customer' || userType === 'user';
  const isProvider = userType === 'provider' || userType === 'business';

  // This page only ever had one connection for customers (payment cards), so send them
  // straight to Manage Card instead of a page with a single pass-through entry — the nav
  // already links here directly, this just covers anyone hitting the URL directly too.
  useEffect(() => {
    if (isCustomer) {
      navigate(paths.dashboard.appSettings.connectManageCards, { replace: true });
    }
  }, [isCustomer, navigate]);

  const providerConnections = useMemo(() => {
    const query = connectSearchValue.trim().toLowerCase();
    if (!query) return PROVIDER_CONNECTIONS;

    return PROVIDER_CONNECTIONS.filter((item) => getConnectionSearchText(item, t).includes(query));
  }, [connectSearchValue, t]);

  if (isCustomer) return null;

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs heading={t('connect')} links={[{ name: t('dashboard'), href: paths.dashboard.root }, { name: t('connect') }]} sx={{ mb: { xs: 3, md: 5 } }} />
      <ConnectConnectionsView
        connections={isProvider ? providerConnections : []}
        isCustomer={false}
        isProvider={isProvider}
        connectSearchValue={connectSearchValue}
        onConnectSearchChange={setConnectSearchValue}
        schedulingUrl={schedulingUrl}
        onSchedulingUrlChange={setSchedulingUrl}
        onViewPayoutMethod={() => navigate(paths.dashboard.appSettings.connectPayoutMethod)}
      />
    </DashboardContent>
  );
}

function getConnectionSearchText(item, t) {
  return [
    t(item.titleKey || item.title),
    t(item.descriptionKey || item.description),
    t(item.buttonLabelKey || item.buttonLabel),
    t(item.status === 'connected' ? 'connected' : 'notConnected'),
  ]
    .join(' ')
    .toLowerCase();
}
