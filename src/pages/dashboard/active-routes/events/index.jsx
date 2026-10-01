import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { EventsView } from 'src/sections/active-sections/events-view/events-view';

// ----------------------------------------------------------------------

const metadata = { title: `Events - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <EventsView />
    </>
  );
}
