import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { BillingHistoryListView } from 'src/sections/active-sections/billing-history/billing-history-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Billing History - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <BillingHistoryListView />
    </>
  );
}
