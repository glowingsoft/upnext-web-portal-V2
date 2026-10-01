import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales/use-locales';
import LegalContentView from 'src/sections/active-sections/legal-content-view/legal-content-view';

// ----------------------------------------------------------------------

const metadata = { title: `Privacy Policy - ${CONFIG.site.name}` };

export default function Page() {
  const { t } = useTranslate();

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <LegalContentView type="privacy" title={t('privacyPolicy')} />
    </>
  );
}
