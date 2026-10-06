import ListingPreviewCard from 'src/sections/home/landing/ListingPreviewCard';

export default function PackageCard({ pkg, onView, hideDistance }) {
  const item = {
    ...pkg,
    providerName: pkg.providerName ?? pkg.businessName ?? pkg.business?.businessName,
    ...(hideDistance && { distance: null }),
  };

  return <ListingPreviewCard kind={pkg.kind === 'service' ? 'service' : 'package'} item={item} onView={onView} />;
}
