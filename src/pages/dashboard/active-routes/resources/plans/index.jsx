import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import PlansView from 'src/sections/active-sections/resources-view/plans/plans-view';

// ----------------------------------------------------------------------

const metadata = { title: `Plans - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PlansView />
    </>
  );
}
