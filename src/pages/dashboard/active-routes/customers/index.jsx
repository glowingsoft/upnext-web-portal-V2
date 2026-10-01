import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { ClientsListView } from 'src/sections/active-sections/clients-view/clients-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Cutomers - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ClientsListView />
    </>
  );
}
