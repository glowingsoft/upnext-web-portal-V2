import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { ProviderListView } from 'src/sections/active-sections/provider-view/provider-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Providers - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ProviderListView />
    </>
  );
}
