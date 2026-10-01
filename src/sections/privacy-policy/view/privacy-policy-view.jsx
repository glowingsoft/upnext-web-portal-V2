import { useTranslate } from 'src/locales/use-locales';
import { useGetLegalContentQuery } from 'src/store/Reducer/settings-api';
import { getApiLanguage, getMultiLangValue } from 'src/utils/multi-lang-content';

import LegalPublicView from 'src/sections/legal/legal-public-view';

export default function PrivacyPolicyView() {
  const { currentLang } = useTranslate();
  const { data, isLoading, isFetching } = useGetLegalContentQuery('privacy');
  const html = getMultiLangValue(data?.data?.privacy_policy, getApiLanguage(currentLang.value));

  return <LegalPublicView title="Privacy Policy" html={html} loading={isLoading || isFetching} />;
}
