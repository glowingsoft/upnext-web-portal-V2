import { Helmet } from 'react-helmet-async';


import { StylistProfileView } from 'src/sections/stylist/view/stylist-profile-view';

// ----------------------------------------------------------------------

const metadata = { title: `Stylist Profile | UpNext` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <StylistProfileView />
    </>
  );
}
