import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { TagsView } from 'src/sections/active-sections/tags-view/tags-view';

// ----------------------------------------------------------------------

const metadata = { title: `Tags - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TagsView />
    </>
  );
}
