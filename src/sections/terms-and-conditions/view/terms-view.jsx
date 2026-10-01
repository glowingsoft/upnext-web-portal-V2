import { useTranslate } from 'src/locales/use-locales';
import { useGetLegalContentQuery } from 'src/store/Reducer/settings-api';
import { getApiLanguage, getMultiLangValue } from 'src/utils/multi-lang-content';

import LegalPublicView from 'src/sections/legal/legal-public-view';

export default function TermsView() {
  const { currentLang } = useTranslate();
  const { data, isLoading, isFetching } = useGetLegalContentQuery('terms');
  const html = getMultiLangValue(data?.data?.terms_and_conditions, getApiLanguage(currentLang.value));

  return <LegalPublicView title="Terms & Conditions" html={html} loading={isLoading || isFetching} />;
}
