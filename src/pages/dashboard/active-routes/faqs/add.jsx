import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { FaqNewEditFormView } from 'src/sections/active-sections/faqs/faq-new-edit-form-view';

// ----------------------------------------------------------------------

const metadata = { title: `Add FAQ - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <FaqNewEditFormView />
    </>
  );
}
