import { Helmet } from 'react-helmet-async';

import { JwtVerifyPasswordView } from 'src/sections/auth/jwt/verify-password-view';

// ----------------------------------------------------------------------

const metadata = { title: `Verify Password | UpNext` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtVerifyPasswordView />
    </>
  );
}
