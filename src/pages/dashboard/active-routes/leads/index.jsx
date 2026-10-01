import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { LeadsListView } from 'src/sections/active-sections/leads-view/leads-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Leads - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <LeadsListView />
    </>
  );
}
