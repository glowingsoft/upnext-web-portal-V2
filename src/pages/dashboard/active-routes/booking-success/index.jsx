import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { BookingSuccessView } from 'src/sections/active-sections/sessions-view/booking-success-view';

// ----------------------------------------------------------------------

const metadata = { title: `Booking Confirmed - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <BookingSuccessView />
    </>
  );
}
