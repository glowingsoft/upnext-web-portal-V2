import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtVerifyAccountView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Verify account | ${CONFIG.site.brand}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtVerifyAccountView />
    </>
  );
}
