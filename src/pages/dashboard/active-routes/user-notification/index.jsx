import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import UserNotification from 'src/sections/active-sections/notification/user-notification';

// ----------------------------------------------------------------------

const metadata = { title: `Notifications - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <UserNotification />
    </>
  );
}
