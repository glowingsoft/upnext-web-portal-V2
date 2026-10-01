import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { PromotionDetailPageView } from 'src/sections/active-sections/promotions-view/promotion-detail-view';

const metadata = { title: `Promotion Details - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <PromotionDetailPageView />
    </>
  );
}
