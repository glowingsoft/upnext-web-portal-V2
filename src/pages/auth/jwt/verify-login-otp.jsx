import { Helmet } from 'react-helmet-async';

import { JwtVerifyLoginOtpView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Two-factor verification | UpNext` };

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
