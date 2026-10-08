import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtVerifyLoginOtpView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Two-factor verification | ${CONFIG.site.brand}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtVerifyLoginOtpView />
    </>
  );
}
