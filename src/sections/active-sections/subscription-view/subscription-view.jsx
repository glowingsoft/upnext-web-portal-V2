import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';

import { SUBSCRIPTION_PLANS } from './subscription-mock';

export default function SubscriptionView() {
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS.find((plan) => plan.active)?.id || 'pro');

  return (
    <DashboardContent maxWidth="lg">
      <CustomBreadcrumbs heading="Subscription" links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Subscription' }]} sx={{ mb: { xs: 3, md: 5 } }} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 3,
          pb: 4,
          alignItems: 'stretch',
        }}
      >
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <Box
              key={plan.id}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 500,
                p: 3,
                borderRadius: 4,
                color: plan.active ? 'common.white' : 'text.primary',
                background: plan.active ? 'linear-gradient(135deg, #1f2937 0%, #374151 35%, #9ca3af 100%)' : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: isSelected ? '0 20px 45px rgba(0,0,0,0.14)' : '0 10px 30px rgba(15,23,42,0.08)',
                border: (theme) => `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transform: isSelected ? 'translateY(-4px)' : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -30,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  bgcolor: plan.active ? 'rgba(255,255,255,0.10)' : 'rgba(59,130,246,0.08)',
                }}
              />

              <Stack spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={plan.active ? 'Most Popular' : 'Flexible Plan'}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: plan.active ? 'rgba(255,255,255,0.18)' : 'rgba(59,130,246,0.10)',
                      color: plan.active ? 'common.white' : 'primary.main',
                    }}
                  />

                  {plan.active && <Iconify icon="solar:verified-check-bold" width={22} />}
                </Stack>

                <Stack spacing={2} alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: plan.active ? 'rgba(255,255,255,0.95)' : 'rgba(59,130,246,0.10)',
                      color: plan.active ? 'grey.900' : 'primary.main',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.10)',
                    }}
                  >
                    <Iconify icon="mdi:crown" width={34} />
                  </Box>

                  <Box>
                    <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 800 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      ${plan.price}
                      <Typography component="span" variant="subtitle1" sx={{ ml: 0.5, opacity: 0.8 }}>
                        /mo
                      </Typography>
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ maxWidth: 260, color: plan.active ? 'rgba(255,255,255,0.82)' : 'text.secondary' }}>
                    {plan.description}
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: plan.active ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.03)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <Stack spacing={1.5}>
                    {plan.features.map((feature) => (
                      <Stack key={feature} direction="row" spacing={1.25} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            mt: 0.2,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: plan.active ? 'rgba(255,255,255,0.16)' : 'rgba(59,130,246,0.12)',
                            color: plan.active ? 'common.white' : 'primary.main',
                            flexShrink: 0,
                          }}
                        >
                          <Iconify icon="eva:checkmark-fill" width={12} />
                        </Box>

                        <Typography variant="body2" sx={{ color: plan.active ? 'rgba(255,255,255,0.95)' : 'text.secondary' }}>
                          {feature}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Stack>

              <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1, mt: 3 }}>
                {plan.active && <Chip label="Current Plan" color="success" sx={{ alignSelf: 'center', fontWeight: 700 }} />}

                <Button
                  fullWidth
                  variant={plan.active ? 'contained' : isSelected ? 'contained' : 'outlined'}
                  color={plan.active ? 'inherit' : 'primary'}
                  onClick={() => setSelectedPlan(plan.id)}
                  sx={{
                    height: 48,
                    borderRadius: 1.5,
                    fontWeight: 700,
                    bgcolor: plan.active ? 'rgba(255,255,255,0.92)' : undefined,
                    color: plan.active ? 'grey.900' : undefined,
                    borderColor: !plan.active && isSelected ? 'primary.main' : undefined,
                    '&:hover': {
                      bgcolor: plan.active ? 'common.white' : undefined,
                    },
                  }}
                >
                  {plan.active ? 'Activated' : isSelected ? 'Selected Plan' : 'Choose Plan'}
                </Button>
              </Stack>
            </Box>
          );
        })}
      </Box>
    </DashboardContent>
  );
}
