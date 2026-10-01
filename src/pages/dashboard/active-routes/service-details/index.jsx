import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { ServiceDetailPageView } from 'src/sections/active-sections/services-view/service-detail-view';

// ----------------------------------------------------------------------

const metadata = { title: `Service Details - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ServiceDetailPageView />
    </>
  );
}
