import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { PackageAddEditFormView } from 'src/sections/active-sections/packages-view/package-new-edit-form-view';

// ----------------------------------------------------------------------

const metadata = { title: `Package - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <PackageAddEditFormView />
    </>
  );
}
