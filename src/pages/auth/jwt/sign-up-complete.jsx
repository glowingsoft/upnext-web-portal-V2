import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtSignUpCompleteView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Complete sign up | ${CONFIG.site.brand}` };

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
