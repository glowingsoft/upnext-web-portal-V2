import { Helmet } from 'react-helmet-async';


import { EventDetailView } from 'src/sections/event/view/event-detail-view';

// ----------------------------------------------------------------------

const metadata = { title: `Event Details | UpNext` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <EventDetailView />
    </>
  );
}
