import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { BoostVisibilityView } from 'src/sections/active-sections/revenue-view/boost-visibility-view';

// ----------------------------------------------------------------------

const metadata = { title: `Boost Your Visibility - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <BoostVisibilityView />
    </>
  );
}
