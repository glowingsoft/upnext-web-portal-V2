import { Box } from '@mui/material';

import { HomeHeader } from 'src/sections/home/home-header';
import LandingFooter from 'src/sections/home/landing/Footer';

export function LandingLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HomeHeader showHowItWorks={false} />
      <Box sx={{ flex: 1 }}>{children}</Box>
      <LandingFooter />
    </Box>
  );
}
