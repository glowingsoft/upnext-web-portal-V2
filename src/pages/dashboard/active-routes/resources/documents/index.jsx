import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { SupportListView } from 'src/sections/active-sections/support-view/supports-list-view';
import { FileManagerView } from 'src/sections/file-manager/view';

// ----------------------------------------------------------------------

const metadata = { title: `Documents - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <FileManagerView />
    </>
  );
}
