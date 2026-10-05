import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BackToTop } from 'src/components/animate/back-to-top';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

import { paths } from 'src/routes/paths';

import { HomeHeader } from '../home-header';
import LandingPage from '../landing/LandingPage';
import LandingFooter from '../landing/Footer';

// ----------------------------------------------------------------------

export function HomeView({ section = 'home' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleJoinAsProvider = () => {
    navigate(paths.auth.jwt.signIn);
  };

  const handleSelectStylist = (stylist) => {
    navigate(paths.stylist.details(stylist.slug || stylist.id), { state: { businessId: stylist.id } });
  };

  const pageProgress = useScrollProgress();

  // Landing header/footer links that used to be their own route (e.g. "How it Works") now just
  // point back here with a scroll target in state, since that content moved into a section of
  // this page — pick it up once mounted and clear it so a later refresh doesn't re-trigger it.
  useEffect(() => {
    const scrollTo = location.state?.scrollTo;
    if (!scrollTo) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    navigate(location.pathname, { replace: true, state: null });

    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  return (
    <>
      <ScrollProgress
        variant="linear"
        progress={pageProgress.scrollYProgress}
        sx={{ position: 'fixed' }}
      />

      <BackToTop />

      <HomeHeader />

      <LandingPage section={section} onJoinAsProvider={handleJoinAsProvider} onSelectStylist={handleSelectStylist} />

      <LandingFooter />
    </>
  );
}
