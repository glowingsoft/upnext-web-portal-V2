import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales/use-locales';
import LegalView from 'src/sections/active-sections/legal-view/legal-view';
import { FaqsHero } from 'src/sections/faqs/faqs-hero';

// ----------------------------------------------------------------------

const metadata = { title: `About Us - ${CONFIG.site.name}` };

export default function Page() {
  const { t } = useTranslate();

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <FaqsHero data={t('aboutUs')} />
      <LegalView type={'about'} />
    </>
  );
}
