import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import PackagePlaceholder from 'src/assets/images/trainer.jpg';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

const isUsableImage = (url) => Boolean(url && !String(url).toLowerCase().includes('noimg'));

const firstUsableImage = (images = []) => images.find(isUsableImage);

const getPackageImage = (pkg) => {
  if (isUsableImage(pkg.image)) return pkg.image;
  if (isUsableImage(pkg.coverImage)) return pkg.coverImage;

  const packagePhoto = firstUsableImage(pkg.photos);
  if (packagePhoto) return packagePhoto;

  const packageMedia = firstUsableImage(pkg.packageMedia);
  if (packageMedia) return packageMedia;

  const serviceImage = (pkg.services || [])
    .flatMap((service) => [
      service.image,
      service.coverImage,
      ...(service.photos || []),
    ])
    .find(isUsableImage);

  return serviceImage || PackagePlaceholder;
};

export default function PackageCard({ pkg, onView, hideDistance }) {
  const { t } = useTranslate();

  const packageName = pkg.name || pkg.packageName || t('package');
  const packagePrice = pkg.packagePrice ?? pkg.price;
  const coverUrl = getPackageImage(pkg);
  const includedServices = pkg.services || [];
  const category = pkg.category?.name || pkg.category?.translations?.en || '';
  const isUnavailable = pkg.isAvailable === false;

  return (
    <Card
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        p: 0,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.primary.light}`,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {isUnavailable ? (
        <Chip
          size="small"
          variant="soft"
          color="error"
          icon={<Iconify icon="solar:close-circle-bold" width={14} />}
          label={t('unavailable')}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
            height: 20,
            fontSize: 10,
            fontWeight: 700,
          }}
        />
      ) : (
        pkg.kind && (
          <Chip
            size="small"
            label={pkg.kind === 'service' ? t('service') : t('package')}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'capitalize',
              bgcolor: '#fff2d0',
              color: '#7a5a2b',
            }}
          />
        )
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, ...(isUnavailable && { opacity: 0.6, filter: 'grayscale(0.4)' }) }}>
      {/* Cover image */}
      <Box
        component="img"
        src={coverUrl}
        alt={packageName}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = PackagePlaceholder;
        }}
        sx={{ width: '100%', height: 140, objectFit: 'cover', flexShrink: 0 }}
      />

      <Stack spacing={1.5} sx={{ p: 2, flex: 1 }}>
        {/* Name */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            {packageName}
          </Typography>
        </Stack>

        {(category || pkg.serviceType) && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {category && (
              <Chip
                label={category}
                size="small"
                icon={<Iconify icon="solar:tag-bold" width={14} />}
                sx={{
                  height: 24,
                  fontWeight: 700,
                  fontSize: 11,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
                  '& .MuiChip-icon': { color: 'primary.contrastText', ml: 0.75 },
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-1px)',
                    boxShadow: (theme) => `0 6px 14px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.22)}`,
                  },
                }}
              />
            )}

            {pkg.serviceType && (
              <Chip
                label={pkg.serviceType}
                size="small"
                sx={{
                  height: 24,
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: 'capitalize',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-1px)',
                    boxShadow: (theme) => `0 6px 14px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.22)}`,
                  },
                }}
              />
            )}
          </Stack>
        )}

        {/* Included services */}
        {includedServices.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('includes')}
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
              {includedServices.slice(0, 3).map((svc) => (
                <Stack key={svc._id} direction="row" alignItems="center" spacing={0.75}>
                  <Iconify icon="solar:check-circle-bold" width={14} sx={{ color: 'success.main', flexShrink: 0 }} />
                  <Typography variant="caption" fontWeight={600} noWrap>
                    {svc.name || svc.serviceName}
                  </Typography>
                </Stack>
              ))}
              {includedServices.length > 3 && (
                <Typography variant="caption" sx={{ color: 'text.disabled', pl: 2.5 }}>
                  {t('moreItemsCount', { count: includedServices.length - 3 })}
                </Typography>
              )}
            </Stack>
          </Box>
        )}

        <Divider />

        {/* Price + action */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1 }}>
              ${packagePrice}
            </Typography>
            {pkg.actualPrice > 0 && pkg.actualPrice !== packagePrice && (
              <Typography variant="caption" sx={{ color: 'text.disabled', textDecoration: 'line-through' }}>
                ${pkg.actualPrice}
              </Typography>
            )}
          </Box>
          <Button
            variant="text"
            size="small"
            onClick={onView}
            endIcon={<Iconify icon="eva:external-link-fill" width={16} />}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              color: 'primary.main',
              px: 0.75,
              minWidth: 'auto',
              borderRadius: 1.5,
              '& .MuiButton-endIcon': { ml: 0.5, transition: 'transform 0.18s ease' },
              '&:hover': { bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08) },
              '&:hover .MuiButton-endIcon': { transform: 'translateX(2px) translateY(-2px)' },
            }}
          >
            {t('details')}
          </Button>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ gap: 0.5 }}>
            <Iconify icon="solar:star-bold" width={14} sx={{ color: 'warning.main' }} />
            <Typography variant="caption" fontWeight={700}>
              {pkg.rating ?? '–'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ({pkg.reviewCount ?? 0} {t('reviews')})
            </Typography>
          </Stack>

          {!hideDistance && pkg.distance != null && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Iconify icon="mingcute:location-fill" width={14} sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t('kmAway', { distance: pkg.distance })}
              </Typography>
            </Box>
          )}
        </Box>
      </Stack>
      </Box>
    </Card>
  );
}
