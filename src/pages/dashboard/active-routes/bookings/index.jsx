import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { SessionsListView } from 'src/sections/active-sections/sessions-view/sessions-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Bookings - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <SessionsListView />
    </>
  );
}
