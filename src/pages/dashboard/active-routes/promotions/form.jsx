import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { PromotionAddEditFormView } from 'src/sections/active-sections/promotions-view/promotion-new-edit-form-view';

// ----------------------------------------------------------------------

const metadata = { title: `Promotion - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <PromotionAddEditFormView />
    </>
  );
}
