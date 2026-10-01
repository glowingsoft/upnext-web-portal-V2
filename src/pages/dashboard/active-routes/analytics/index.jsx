import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { AnalyticsView } from 'src/sections/active-sections/analytics-view/analytics-view';

const metadata = { title: `Analytics - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <AnalyticsView />
    </>
  );
}
