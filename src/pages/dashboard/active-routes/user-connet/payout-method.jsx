import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { PayoutMethodsView } from 'src/sections/active-sections/payout-methods-view/payout-methods-view';

// ----------------------------------------------------------------------

const metadata = { title: `Payout Method - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <PayoutMethodsView />
    </>
  );
}
