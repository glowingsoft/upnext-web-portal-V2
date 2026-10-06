import { Box } from '@mui/material';

import { HomeHeader } from 'src/sections/home/home-header';
import LandingFooter from 'src/sections/home/landing/Footer';
import { usePublicFonts } from 'src/hooks/use-public-fonts';

export function LandingLayout({ children }) {
  usePublicFonts();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HomeHeader showHowItWorks={false} />
      <Box sx={{ flex: 1 }}>{children}</Box>
      <LandingFooter />
    </Box>
  );
}
