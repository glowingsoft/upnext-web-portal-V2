import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

export function StepProviderSocial() {
  const { t } = useTranslate();

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle1">
          {t('socialLinks')}{' '}
          <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontWeight: 'fontWeightRegular' }}>
            ({t('optional')})
          </Typography>
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('addSocialLinksDescription')}
        </Typography>
      </Stack>

      <Field.Text
        name="instagram"
        label={t('instagram')}
        placeholder="https://instagram.com/yourusername"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="mdi:instagram" width={20} />
            </InputAdornment>
          ),
        }}
      />

      <Field.Text
        name="facebook"
        label={t('facebook')}
        placeholder="https://facebook.com/yourpage"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="mdi:facebook" width={20} />
            </InputAdornment>
          ),
        }}
      />

      <Field.Text
        name="linkedin"
        label={t('linkedin')}
        placeholder="https://linkedin.com/in/yourprofile"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="mdi:linkedin" width={20} />
            </InputAdornment>
          ),
        }}
      />

      <Field.Text
        name="website"
        label={t('website')}
        placeholder="https://yourwebsite.com"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="mdi:web" width={20} />
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
}
