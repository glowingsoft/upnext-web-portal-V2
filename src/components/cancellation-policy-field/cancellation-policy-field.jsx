import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';
import { CANCELLATION_POLICY_OPTIONS } from 'src/utils/cancellation-policy';

export function CancellationPolicyField({ name = 'cancellationPolicy', sx }) {
  const { t } = useTranslate();
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box role="radiogroup" sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, ...sx }}>
          {CANCELLATION_POLICY_OPTIONS.map((option) => {
            const selected = field.value === option.value;
            return (
              <Box
                key={option.value}
                component="button"
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => field.onChange(option.value)}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  borderRadius: 1.5,
                  border: '1.5px solid',
                  borderColor: selected ? 'primary.main' : 'divider',
                  bgcolor: selected ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08) : 'background.paper',
                  transition: (theme) => theme.transitions.create(['border-color', 'background-color'], { duration: 150 }),
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: 1.25,
                    display: 'grid',
                    placeItems: 'center',
                    color: selected ? 'primary.main' : 'text.secondary',
                    bgcolor: selected ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.14) : 'background.neutral',
                  }}
                >
                  <Iconify icon={option.icon} width={22} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                    {t(option.labelKey, { defaultValue: option.label })}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.25, color: 'text.secondary' }}>
                    {t(option.descriptionKey, { defaultValue: option.description })}
                  </Typography>
                </Box>

                <Iconify
                  icon={selected ? 'solar:check-circle-bold' : 'solar:record-linear'}
                  width={22}
                  sx={{ flexShrink: 0, color: selected ? 'primary.main' : 'text.disabled' }}
                />
              </Box>
            );
          })}
        </Box>
      )}
    />
  );
}
