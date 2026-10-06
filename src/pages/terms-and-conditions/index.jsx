import { Helmet } from 'react-helmet-async';


import TermsView from 'src/sections/terms-and-conditions/view/terms-view';

const metadata = { title: `Terms & Conditions | UpNext` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <TermsView />
    </>
  );
}
