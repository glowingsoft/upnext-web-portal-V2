import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import ConnectView from 'src/sections/active-sections/connect-view/connect-view';

// ----------------------------------------------------------------------

const metadata = { title: `Connect - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ConnectView />
    </>
  );
}
