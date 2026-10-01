import { Helmet } from 'react-helmet-async';
import { JwtAdminLoginView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Admin Sign in | UpNext` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtAdminLoginView />
    </>
  );
}
