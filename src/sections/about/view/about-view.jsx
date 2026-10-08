import { useTranslate } from 'src/locales/use-locales';
import { useGetLegalContentQuery } from 'src/store/Reducer/settings-api';
import { getApiLanguage, getMultiLangValue } from 'src/utils/multi-lang-content';

import LegalPublicView from 'src/sections/legal/legal-public-view';

export function AboutView() {
  const { currentLang } = useTranslate();
  const { data, isLoading, isFetching } = useGetLegalContentQuery('about');
  const html = getMultiLangValue(data?.data?.about_us, getApiLanguage(currentLang.value));

  return <LegalPublicView eyebrow="Company" title="About Us" html={html} loading={isLoading || isFetching} />;
}
