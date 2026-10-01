import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export function useCollapseNav({ defaultCollapsed = false } = {}) {
  const [openMobile, setOpenMobile] = useState(false);

  const [collapseDesktop, setCollapseDesktop] = useState(defaultCollapsed);

  const onCollapseDesktop = useCallback(() => {
    setCollapseDesktop((prev) => !prev);
  }, []);

  const onCloseDesktop = useCallback(() => {
    setCollapseDesktop(false);
  }, []);

  const onOpenMobile = useCallback(() => {
    setOpenMobile(true);
  }, []);

  const onCloseMobile = useCallback(() => {
    setOpenMobile(false);
  }, []);

  return {
    collapseDesktop,
    onCloseDesktop,
    onCollapseDesktop,
    //
    openMobile,
    onOpenMobile,
    onCloseMobile,
  };
}
