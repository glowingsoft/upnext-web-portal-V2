import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import ClientsDetailView from 'src/sections/active-sections/clients-detail-view/clients-detail-view';

// ----------------------------------------------------------------------

const metadata = { title: `Customer Details - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ClientsDetailView />
    </>
  );
}
