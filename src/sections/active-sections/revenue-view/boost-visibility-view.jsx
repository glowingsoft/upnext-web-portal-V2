import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks';
import { varAlpha } from 'src/theme/styles';

import {
  BOOST_VISIBILITY,
} from './mocks/boost-visibility-data';
import { FaqsHero } from 'src/sections/faqs/faqs-hero';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

function BoostContentSection({ onBoost, isSubmitting }) {
  const { paragraphs } = BOOST_VISIBILITY;

  return (
    <Card sx={{ mt: 3, marginLeft: "40px", p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={2.5}>
        {paragraphs.map((text) => (
          <Typography key={text} variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75 }}>
            {text}
          </Typography>
        ))}

        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={isSubmitting}
          onClick={onBoost}
          sx={{ borderRadius: 2, py: 1.5, fontWeight: 700, textTransform: 'none', mt: 1 }}
        >
          {isSubmitting ? 'Processing…' : 'Boost'}
        </Button>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

export function BoostVisibilityView() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBoost = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Boost activated successfully');
      router.back();
    }, 800);
  };

  const { title } = BOOST_VISIBILITY;

  return (
    <DashboardContent maxWidth={false} >
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<Iconify width={16} height={16} sx={{ fontWeight: 800 }} icon="solar:alt-arrow-left-linear" />}
          onClick={() => router.back()}
          sx={{ color: 'text.primary', fontWeight: 800 }}
        >
          Back
        </Button>
      </Box>

      <FaqsHero data={'Boost Your Visibility'} />

      <BoostContentSection onBoost={handleBoost} isSubmitting={isSubmitting} />
    </DashboardContent >
  );
}
