import { Helmet } from 'react-helmet-async';

import { JwtSignUpCompleteView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Complete sign up | UpNext` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtSignUpCompleteView />
    </>
  );
}
