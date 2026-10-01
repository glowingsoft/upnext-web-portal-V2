import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function SignUpStepper({ steps, activeStep }) {
  const currentStep = steps[activeStep];

  return (
    <Stack spacing={1.25} sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
          {currentStep?.label}
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Step {activeStep + 1} of {steps.length}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
        {steps.map((step, index) => (
          <Box
            key={step.label}
            sx={{
              height: 4,
              flex: 1,
              minWidth: 20,
              borderRadius: 2,
              bgcolor: index <= activeStep ? 'primary.main' : 'divider',
              transition: 'background-color 0.3s ease',
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}
