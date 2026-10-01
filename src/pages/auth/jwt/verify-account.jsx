import { Helmet } from 'react-helmet-async';

import { JwtVerifyAccountView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Verify account | UpNext` };

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
