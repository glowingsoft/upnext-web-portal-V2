import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import UserFaqsView from 'src/sections/active-sections/faqs/user-faqs-view';

// ----------------------------------------------------------------------

const metadata = { title: `FAQs - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <UserFaqsView />
    </>
  );
}
