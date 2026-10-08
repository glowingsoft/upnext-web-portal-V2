import { paths } from 'src/routes/paths';

import { ErrorPageView } from './error-page-view';

// ----------------------------------------------------------------------

export function View403() {
  return (
    <ErrorPageView
      code="403"
      title="You don’t have access to this page"
      description="This page is restricted for your account. If you think that is a mistake, get in touch and we will look into it."
      secondaryAction={{ label: 'Contact us', href: paths.contact }}
    />
  );
}
