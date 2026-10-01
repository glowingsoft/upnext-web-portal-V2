import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import CheckInsView from 'src/sections/active-sections/resources-view/check-ins/check-ins-view';

// ----------------------------------------------------------------------

const metadata = { title: `Check-Ins - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CheckInsView />
    </>
  );
}
