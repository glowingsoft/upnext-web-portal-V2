import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { PackageDetailPageView } from 'src/sections/active-sections/packages-view/package-detail-view';

const metadata = { title: `Package Details - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <PackageDetailPageView />
    </>
  );
}
