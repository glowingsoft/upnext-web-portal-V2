import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import TasksView from '../../../../sections/active-sections/tasks-view/tasks-view';

// ----------------------------------------------------------------------

const metadata = { title: `Tasks - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TasksView />
    </>
  );
}
