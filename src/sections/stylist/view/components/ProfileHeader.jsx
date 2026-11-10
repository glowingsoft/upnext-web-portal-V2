import { useEffect, useState } from 'react';

import { Avatar, Box, Chip, Popover, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { brand } from 'src/sections/home/landing/theme';
import SurfaceCard from 'src/sections/home/landing/SurfaceCard';
import { isRealCoords } from 'src/utils/my-location-storage';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';

// ----------------------------------------------------------------------

export default function ProfileHeader({ business }) {
  const [coverImageError, setCoverImageError] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    setCoverImageError(false);
    setAvatarImageError(false);
    setDescriptionExpanded(false);
  }, [business?._id]);

  const coverImage = normalizeImageUrl(business.coverImage);
  const isLicensed = String(business.certifications?.status || '').toLowerCase() === 'approved';
  const isLongDescription = (business.description?.length || 0) > 240;
  const totalReviews = business.rating?.totalReviews ?? 0;

  return (
    <SurfaceCard sx={{ mb: 3, overflow: 'hidden', borderRadius: 3, border: `1px solid ${alpha(brand.green[400], 0.2)}` }}>
      {/* Cover image */}
      <Box
        sx={{
          height: { xs: 150, md: 220 },
          position: 'relative',
          overflow: 'hidden',
          background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            display: coverImage && !coverImageError ? 'block' : 'none',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.32) 100%)',
          },
        }}
      >
        {coverImage && !coverImageError && (
          <Box
            component="img"
            src={coverImage}
            alt={business.businessName}
            onError={() => setCoverImageError(true)}
            sx={{ position: 'absolute', inset: 0, width: 1, height: 1, objectFit: 'cover', zIndex: 0 }}
          />
        )}
      </Box>

      <Box
        sx={{
          px: { xs: 2.5, md: 4 },
          pb: { xs: 2.5, md: 3.5 },
          position: 'relative',
          background: `linear-gradient(135deg, ${alpha(brand.green[400], 0.08)} 0%, ${alpha(brand.green[200], 0.05)} 100%)`,
        }}
      >
        {/* Identity row — avatar overlaps the cover's bottom edge */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'flex-start',
            gap: { xs: 1.5, sm: 2.5 },
          }}
        >
          <Box sx={{ position: 'relative', flexShrink: 0, mt: { xs: -5, md: -6 }, zIndex: 2 }}>
            <Avatar
              src={!avatarImageError ? normalizeImageUrl(business.image) : undefined}
              slotProps={{ img: { onError: () => setAvatarImageError(true) } }}
              alt={business.businessName}
              sx={{
                width: { xs: 88, md: 112 },
                height: { xs: 88, md: 112 },
                border: 'solid 4px #fff',
                bgcolor: 'primary.dark',
                color: '#fff',
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '1.75rem' },
                boxShadow: '0 8px 20px rgba(0,0,0,0.22)',
              }}
            >
              {(business.businessName || '?').trim().charAt(0).toUpperCase()}
            </Avatar>
            {business.isAvailable && (
              <Box
                aria-label="Active provider"
                sx={{
                  position: 'absolute',
                  right: { xs: 4, md: 8 },
                  bottom: { xs: 4, md: 8 },
                  width: { xs: 18, md: 20 },
                  height: { xs: 18, md: 20 },
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  border: '2px solid #fff',
                  boxShadow: `0 2px 6px ${alpha('#000', 0.18)}`,
                }}
              />
            )}
          </Box>

          {/* Name + meta (right padding keeps clear of the Share button) */}
          <Box sx={{ flex: 1, minWidth: 0, pt: { sm: 2 }, pr: { xs: 0, sm: 14 } }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '1.4rem', md: '1.75rem' }, lineHeight: 1.25 }}>
              {business.businessName}
            </Typography>

            {/* One font size + line height across the row so every item shares a baseline */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                columnGap: 1.25,
                rowGap: 0.75,
                fontSize: '0.8125rem',
                lineHeight: '20px',
              }}
            >
              {totalReviews > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="mingcute:star-fill" width={15} sx={{ color: '#F59E0B', display: 'block' }} />
                  <Box component="span" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {Number(business.rating?.avgRating || 0).toFixed(1)}
                  </Box>
                  <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="mingcute:star-line" width={15} sx={{ color: brand.green[400], display: 'block' }} />
                  <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    New on UpNext
                  </Box>
                </Box>
              )}

              {business.location?.address && (
                <>
                  <MetaDot />
                  <Box
                    component="a"
                    href={getMapsUrl(business.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open in Google Maps"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      minWidth: 0,
                      color: 'text.secondary',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                      '&:hover': { color: brand.green[600] },
                      '&:hover .address-text': { textDecoration: 'underline', textUnderlineOffset: 3 },
                    }}
                  >
                    <Iconify icon="mingcute:location-line" width={15} sx={{ flexShrink: 0, display: 'block' }} />
                    <Box
                      component="span"
                      className="address-text"
                      sx={{ fontWeight: 500, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {business.location.address}
                    </Box>
                    <Iconify icon="mingcute:external-link-line" width={13} sx={{ flexShrink: 0, display: 'block', opacity: 0.7 }} />
                  </Box>
                </>
              )}

              {isLicensed && (
                <Chip
                  icon={<Iconify icon="solar:shield-check-bold" width={13} sx={{ color: brand.green[600] }} />}
                  label="Licensed Professional"
                  size="small"
                  sx={{
                    height: 24,
                    bgcolor: alpha(brand.green[400], 0.12),
                    color: brand.green[800],
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    border: `1px solid ${alpha(brand.green[400], 0.3)}`,
                    pointerEvents: 'none',
                    '& .MuiChip-label': { px: 0.75 },
                    '& .MuiChip-icon': { ml: 0.5, mr: -0.25 },
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {business.nameSlug && (
          <Box sx={{ position: 'absolute', top: { xs: 12, md: 16 }, right: { xs: 16, md: 24 } }}>
            <ShareProfileButton slug={business.nameSlug} />
          </Box>
        )}

        {/* About — full width, clamped so long bios don't push the page down */}
        {business.description && (
          <Box sx={{ mt: 2.5, maxWidth: 880 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.75,
                ...(!descriptionExpanded && {
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }),
              }}
            >
              {business.description}
            </Typography>
            {isLongDescription && (
              <Box
                component="button"
                type="button"
                onClick={() => setDescriptionExpanded((prev) => !prev)}
                sx={{
                  mt: 0.5,
                  p: 0,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: brand.green[600],
                  '&:hover': { color: brand.green[800] },
                }}
              >
                {descriptionExpanded ? 'Show less' : 'Read more'}
              </Box>
            )}
          </Box>
        )}

        {business.categories?.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 2 }}>
            {business.categories.map((cat) => (
              <Chip
                key={cat._id}
                label={cat.name}
                size="small"
                sx={{
                  bgcolor: '#fff',
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: (t) => `1px solid ${t.palette.divider}`,
                  pointerEvents: 'none',
                  '& .MuiChip-label': { px: 1.25 },
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </SurfaceCard>
  );
}


function getMapsUrl(location) {
  const [lng, lat] = location?.coordinates || [];
  const query = isRealCoords(lat, lng) ? `${lat},${lng}` : location?.address || '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function MetaDot() {
  return (
    <Box
      component="span"
      sx={{ display: { xs: 'none', sm: 'block' }, width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled', flexShrink: 0 }}
    />
  );
}

// ----------------------------------------------------------------------

function ShareProfileButton({ slug }) {
  const { copy } = useCopyToClipboard();
  const [copied, setCopied] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const url = `${window.location.origin}${paths.stylist.details(slug)}`;
  const displayUrl = url.replace(/^https?:\/\//, '');

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (await copy(url)) {
      setCopied(true);
      toast.success('Profile link copied');
    } else {
      toast.error('Could not copy the link');
    }
  };

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          px: { xs: 1.25, sm: 1.75 },
          py: 0.75,
          borderRadius: 99,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: brand.green[600],
          bgcolor: '#fff',
          border: `1px solid ${alpha(brand.green[400], 0.35)}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'background-color 0.15s ease, border-color 0.15s ease',
          '&:hover': { bgcolor: alpha(brand.green[400], 0.06), borderColor: brand.green[400] },
        }}
      >
        <Iconify icon="mingcute:share-forward-line" width={16} />
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Share
        </Box>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, p: 2, width: 340, maxWidth: 'calc(100vw - 32px)', borderRadius: 2.5 } } }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.25 }}>Share this profile</Typography>
        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mb: 1.5 }}>
          Anyone with this link can view the profile.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pl: 1.5,
            pr: 0.5,
            py: 0.5,
            borderRadius: 99,
            border: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: (t) => alpha(t.palette.text.primary, 0.03),
          }}
        >
          <Iconify icon="mingcute:link-line" width={16} sx={{ color: 'text.disabled', flexShrink: 0 }} />
          <Typography noWrap title={url} sx={{ flex: 1, minWidth: 0, fontSize: '0.8rem', fontWeight: 600, color: 'text.secondary' }}>
            {displayUrl}
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={handleCopy}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              flexShrink: 0,
              px: 1.5,
              py: 0.6,
              border: 'none',
              borderRadius: 99,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#fff',
              bgcolor: copied ? 'success.main' : brand.green[400],
              transition: 'background-color 0.15s ease',
              '&:hover': { bgcolor: copied ? 'success.dark' : brand.green[600] },
            }}
          >
            <Iconify icon={copied ? 'mingcute:check-line' : 'mingcute:copy-2-line'} width={14} />
            {copied ? 'Copied' : 'Copy'}
          </Box>
        </Box>

      </Popover>
    </>
  );
}
