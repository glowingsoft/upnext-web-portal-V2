import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { BadgesView } from 'src/sections/active-sections/badges-view/badges-view';

// ----------------------------------------------------------------------

const metadata = { title: `Badges - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BadgesView />
    </>
  );
}
