import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { ManageCardsPage } from 'src/sections/active-sections/cards-view';

// ----------------------------------------------------------------------

const metadata = { title: `Payment Methods -${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ManageCardsPage />
    </>
  );
}
