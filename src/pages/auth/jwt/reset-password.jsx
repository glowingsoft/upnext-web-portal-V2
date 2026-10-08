import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtResetPasswordView } from 'src/sections/auth/jwt/reset-password-view';

// ----------------------------------------------------------------------

const metadata = { title: `Reset Password | ${CONFIG.site.brand}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtResetPasswordView />
    </>
  );
}
