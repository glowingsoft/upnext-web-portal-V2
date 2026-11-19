import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { LiveOffersView } from 'src/sections/live-offers/view/live-offers-view';

// ----------------------------------------------------------------------

const metadata = { title: `Live Booking Offers - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <LiveOffersView />
    </>
  );
}
