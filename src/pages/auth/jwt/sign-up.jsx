import { Helmet } from 'react-helmet-async';

import { JwtSignUpView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Sign up | UpNext` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtSignUpView />
    </>
  );
}
