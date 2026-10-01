import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import ProviderDetailView from 'src/sections/active-sections/provider-detail-view/provider-detail-view';

// ----------------------------------------------------------------------

const metadata = { title: `Provider Details - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ProviderDetailView />
    </>
  );
}
