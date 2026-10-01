import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';
import { OperatingHoursEditView } from 'src/sections/active-sections/provider-detail-view/operating-hours-edit-view';

// ----------------------------------------------------------------------

const metadata = { title: `Edit Operating Hours - ${CONFIG.site.name}` };
const PROVIDER_USER_TYPES = new Set(['provider', 'business']);

export default function Page() {
  const userState = useSelector((state) => state.user);
  const userType = userState?.user?.accountState?.userType ?? userState?.accountState?.userType;

  if (!PROVIDER_USER_TYPES.has(userType)) {
    return <Navigate to={paths.dashboard.root} replace />;
  }

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <OperatingHoursEditView />
    </>
  );
}
