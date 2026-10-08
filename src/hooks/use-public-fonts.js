import { useEffect } from 'react';

const CLASS_NAME = 'public-fonts';

let mountedCount = 0;

export function usePublicFonts() {
  useEffect(() => {
    mountedCount += 1;
    document.body.classList.add(CLASS_NAME);

    return () => {
      mountedCount -= 1;
      if (mountedCount === 0) document.body.classList.remove(CLASS_NAME);
    };
  }, []);
}
