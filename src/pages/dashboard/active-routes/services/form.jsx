import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';
import { ServiceAddEditFormView } from 'src/sections/active-sections/services-view/service-new-edit-form-view';

// ----------------------------------------------------------------------

const metadata = { title: `Service - ${CONFIG.site.name}` };
const CUSTOMER_USER_TYPES = new Set(['customer', 'user']);

export default function Page() {
  const userState = useSelector((state) => state.user);
  const userType = userState?.user?.accountState?.userType ?? userState?.accountState?.userType;

  if (CUSTOMER_USER_TYPES.has(userType)) {
    return <Navigate to={paths.dashboard.services} replace />;
  }

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ServiceAddEditFormView />
    </>
  );
}
