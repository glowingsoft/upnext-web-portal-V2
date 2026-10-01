import { Helmet } from 'react-helmet-async';

import { JwtResetPasswordView } from 'src/sections/auth/jwt/reset-password-view';

// ----------------------------------------------------------------------

const metadata = { title: `Reset Password | UpNext` };

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
