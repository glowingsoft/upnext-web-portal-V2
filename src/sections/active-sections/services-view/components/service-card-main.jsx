import ListingPreviewCard from 'src/sections/home/landing/ListingPreviewCard';

export default function ServiceCard({ svc, onView, hideDistance }) {
  const item = {
    ...svc,
    providerName: svc.providerName ?? svc.businessName ?? svc.business?.businessName,
    ...(hideDistance && { distance: null }),
  };

  return <ListingPreviewCard kind={svc.kind === 'package' ? 'package' : 'service'} item={item} onView={onView} />;
}
