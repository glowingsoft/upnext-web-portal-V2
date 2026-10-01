import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import UserContactUsView from 'src/sections/active-sections/user-contact-us-view/user-contact-us-view';

// ----------------------------------------------------------------------

const metadata = { title: `Contact Us - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <UserContactUsView />
    </>
  );
}
