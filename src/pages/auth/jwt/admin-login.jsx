import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { JwtAdminLoginView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Admin Sign in | ${CONFIG.site.brand}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtAdminLoginView />
    </>
  );
}
