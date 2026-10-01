import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { ReviewsListView } from 'src/sections/active-sections/reviews-view/reviews-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Reviews - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ReviewsListView />
    </>
  );
}
