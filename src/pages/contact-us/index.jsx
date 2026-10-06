import { Helmet } from 'react-helmet-async';


import { ContactView } from 'src/sections/contact/view';

// ----------------------------------------------------------------------

const metadata = { title: `Contact us | UpNext` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ContactView />
    </>
  );
}
