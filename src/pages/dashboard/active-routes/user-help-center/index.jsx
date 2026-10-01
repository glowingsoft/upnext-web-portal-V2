import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import UserHelpCenterView from 'src/sections/active-sections/help-center/user-help-center-view';

// ----------------------------------------------------------------------

const metadata = { title: `Help Center - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <UserHelpCenterView />
    </>
  );
}
