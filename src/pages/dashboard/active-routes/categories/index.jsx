import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { CategoriesView } from 'src/sections/active-sections/categories-view/categories-view';

// ----------------------------------------------------------------------

const metadata = { title: `Categories - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CategoriesView />
    </>
  );
}
