import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { BookingDetailPageView } from 'src/sections/active-sections/sessions-view/booking-detail-view';

// ----------------------------------------------------------------------

const metadata = { title: `Booking Details - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <BookingDetailPageView />
    </>
  );
}
