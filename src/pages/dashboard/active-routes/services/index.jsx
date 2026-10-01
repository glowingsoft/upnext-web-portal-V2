import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';

import { CONFIG } from 'src/config-global';
import { CustomerServicesView } from 'src/sections/active-sections/services-view/customer-services-view';
import { ServicesListView } from 'src/sections/active-sections/services-view/services-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Services - ${CONFIG.site.name}` };

export default function Page() {
  const userState = useSelector((state) => state.user);
  const userType = userState?.user?.accountState?.userType ?? userState?.accountState?.userType;
  const isCustomer = userType === 'customer' || userType === 'user';

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      {isCustomer ? <CustomerServicesView /> : <ServicesListView />}
    </>
  );
}
