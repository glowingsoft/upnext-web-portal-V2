import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { PromotionsListView } from 'src/sections/active-sections/promotions-view/promotions-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Promotions - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PromotionsListView />
    </>
  );
}
