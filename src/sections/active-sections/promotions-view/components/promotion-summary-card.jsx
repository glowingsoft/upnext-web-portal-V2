import { useTranslate } from 'src/locales/use-locales';

import PromotionCard from './promotion-card';

// Provider/admin management views: same card as customers see, without the "Claim Offer" action.
export default function PromotionSummaryCard({ svc, providerName, onView }) {
  const { t } = useTranslate();

  return <PromotionCard svc={svc} providerName={providerName} onView={onView} hideDistance actionLabel={t('details')} />;
}
