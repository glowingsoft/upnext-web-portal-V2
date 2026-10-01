import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { RevenueView } from 'src/sections/active-sections/revenue-view/revenue-view';

// ----------------------------------------------------------------------

const metadata = { title: `Revenue - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <RevenueView />
    </>
  );
}
