import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { PackagesListView } from 'src/sections/active-sections/packages-view/packages-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Packages - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PackagesListView />
    </>
  );
}
