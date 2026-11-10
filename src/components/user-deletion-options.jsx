import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

export function UserDeletionOptions({ value, onChange }) {
  const { t } = useTranslate();

  const options = [
    {
      value: 'soft',
      title: t('softDeleteOption'),
      description: t('softDeleteDescription'),
      icon: 'solar:archive-bold',
    },
    {
      value: 'hard',
      title: t('hardDeleteOption'),
      description: t('hardDeleteDescription'),
      icon: 'solar:trash-bin-trash-bold',
    },
  ];

  return (
    <FormControl fullWidth sx={{ mt: 2 }}>
      <RadioGroup value={value} onChange={(event) => onChange(event.target.value)} aria-label={t('deletionType')}>
        <Stack spacing={1}>
          {options.map((option) => (
            <Box
              key={option.value}
              sx={{
                px: 1.5,
                border: '1px solid',
                borderColor: value === option.value ? 'primary.main' : 'divider',
                borderRadius: 1.5,
                bgcolor: value === option.value ? 'primary.lighter' : 'background.paper',
                transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
              }}
            >
              <FormControlLabel
                value={option.value}
                control={<Radio />}
                sx={{ m: 0, py: 0.75, width: '100%', alignItems: 'flex-start' }}
                label={
                  <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ py: 0.5 }}>
                    <Iconify icon={option.icon} width={20} sx={{ mt: 0.25, color: value === option.value ? 'primary.main' : 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {option.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </Stack>
                }
              />
            </Box>
          ))}
        </Stack>
      </RadioGroup>
    </FormControl>
  );
}

UserDeletionOptions.propTypes = {
  value: PropTypes.oneOf(['soft', 'hard']).isRequired,
  onChange: PropTypes.func.isRequired,
};
