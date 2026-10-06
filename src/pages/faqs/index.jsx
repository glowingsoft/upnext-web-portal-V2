import { Helmet } from 'react-helmet-async';


import { FaqsView } from 'src/sections/faqs/view';

// ----------------------------------------------------------------------

const metadata = { title: `Faqs | UpNext` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <FaqsView />
    </>
  );
}
