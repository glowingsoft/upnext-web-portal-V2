import { Helmet } from 'react-helmet-async';

import { JwtForgetPasswordView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Forget Password | UpNext` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtForgetPasswordView />
    </>
  );
}
