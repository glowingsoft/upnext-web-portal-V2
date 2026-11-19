import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { InstantBookingSettingsView } from 'src/sections/active-sections/instant-booking-view/instant-booking-settings-view';

// ----------------------------------------------------------------------

const metadata = { title: `Instant Booking - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <InstantBookingSettingsView />
    </>
  );
}
