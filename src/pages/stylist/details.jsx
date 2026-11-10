import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { StylistProfileView } from 'src/sections/stylist/view/stylist-profile-view';

// ----------------------------------------------------------------------

const metadata = { title: `Provider Profile | ${CONFIG.site.brand}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <StylistProfileView />
    </>
  );
}
