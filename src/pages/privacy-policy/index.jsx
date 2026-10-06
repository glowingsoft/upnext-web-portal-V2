import { Helmet } from 'react-helmet-async';


import PrivacyPolicyView from 'src/sections/privacy-policy/view/privacy-policy-view';

const metadata = { title: `Privacy Policy | UpNext` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <PrivacyPolicyView />
    </>
  );
}
