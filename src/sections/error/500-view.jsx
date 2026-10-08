import { paths } from 'src/routes/paths';

import { ErrorPageView } from './error-page-view';

// ----------------------------------------------------------------------

export function View500() {
  return (
    <ErrorPageView
      code="500"
      title="Something went wrong on our side"
      description="We hit an unexpected error. Please try again in a moment, and let us know if it keeps happening."
      secondaryAction={{ label: 'Contact us', href: paths.contact }}
    />
  );
}
