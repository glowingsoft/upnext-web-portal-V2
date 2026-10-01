import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { BusinessProfileEditFormView } from 'src/sections/active-sections/provider-detail-view/business-profile-edit-form-view';

// ----------------------------------------------------------------------

const metadata = { title: `Edit Business Profile - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <BusinessProfileEditFormView />
    </>
  );
}
