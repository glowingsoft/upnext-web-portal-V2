import { paths } from 'src/routes/paths';

import { ErrorPageView } from './error-page-view';

// ----------------------------------------------------------------------

export function NotFoundView() {
  return (
    <ErrorPageView
      code="404"
      illustrated
      title="We couldn’t find that page"
      description="The link may be out of date or the address may have a typo. Head back home or browse the services on offer."
      secondaryAction={{ label: 'Browse services', href: paths.services }}
    />
  );
}
