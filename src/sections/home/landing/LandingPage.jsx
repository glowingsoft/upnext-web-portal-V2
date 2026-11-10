import { m } from 'framer-motion';
import { Box, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { varFade, MotionViewport } from 'src/components/animate';

import HeroBanner from './HeroBanner';
import PageHero from './PageHero';
import AvailabilitySection from './AvailabilitySection';
import EventsSection from './EventsSection';
import HowItWorksSection from './HowItWorksSection';
import ReviewsAndWhySection from './ReviewsAndWhySection';
import ServicesPackagesSection from './ServicesPackagesSection';

export default function LandingPage({ section = 'home', onJoinAsProvider, onSelectStylist }) {
  const theme = useTheme();

  const sectionContent = {
    home: (
      <>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <HeroBanner onJoinAsProvider={onJoinAsProvider} />
        </m.div>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
        >
          <AvailabilitySection onSelectStylist={onSelectStylist} />
        </m.div>
        <Box component={MotionViewport}>
          <m.div variants={varFade({ distance: 24 }).inUp}>
            <HowItWorksSection />
          </m.div>
        </Box>
      </>
    ),
    reviews: (
      <Box component={MotionViewport}>
        <PageHero
          eyebrow="Reviews"
          title="Customer Reviews"
          subtitle="Hear from clients who found and booked their provider through UpNext."
        />
        <m.div variants={varFade({ distance: 24 }).inUp}>
          <ReviewsAndWhySection onJoinAsProvider={onJoinAsProvider} />
        </m.div>
      </Box>
    ),
    events: (
      <Box component={MotionViewport}>
        <PageHero eyebrow="Events" title="Events Near You" subtitle="Browse what is happening in your city and plan your look around it." />
        <m.div variants={varFade({ distance: 24 }).inUp}>
          <EventsSection />
        </m.div>
      </Box>
    ),
    services: (
      <Box component={MotionViewport}>
        <PageHero
          eyebrow="Services"
          title="Services & Packages"
          subtitle="Explore treatments and bundles offered by providers near you."
        />
        <m.div variants={varFade({ distance: 24 }).inUp}>
          <ServicesPackagesSection />
        </m.div>
      </Box>
    ),
  }[section];

  return (
    <Box
      id="home"
      sx={{
        minHeight: '100vh',
        overflowX: 'hidden',
        pt: { xs: 8, md: 10 },
        pb: 5,
        background: `linear-gradient(170deg, #F3EADC 0%, #FDFBF7 45%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(4px)',
            overflow: 'hidden',
          }}
        >
          {sectionContent}
        </Box>
      </Container>
    </Box>
  );
}
