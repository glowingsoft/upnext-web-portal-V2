import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Lightbox, useLightBox } from 'src/components/lightbox';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------

export function PhotosGallery({ photos, altPrefix = 'Photo', sx, ...other }) {
  const { t } = useTranslate();
  const slides = photos?.map((url) => ({ src: url })) || [];
  const lightbox = useLightBox(slides);

  if (!photos?.length) return null;

  return (
    <Card sx={[{ p: 2.5, borderRadius: 2 }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Iconify icon="solar:gallery-wide-bold" width={20} sx={{ color: 'primary.main' }} />
        <Typography variant="h6">{t('photos', { defaultValue: 'Photos' })}</Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 140px))',
          gap: 1.5,
        }}
      >
        {photos.map((url, index) => (
          <Box
            key={url}
            onClick={() => lightbox.onOpen(url)}
            sx={{
              cursor: 'zoom-in',
              borderRadius: 1.5,
              overflow: 'hidden',
              aspectRatio: '1 / 1',
              bgcolor: 'background.neutral',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => `0 8px 20px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.14)}`,
              },
            }}
          >
            <Box component="img" src={url} alt={`${altPrefix} ${index + 1}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        ))}
      </Box>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
        onGetCurrentIndex={(index) => lightbox.setSelected(index)}
      />
    </Card>
  );
}
