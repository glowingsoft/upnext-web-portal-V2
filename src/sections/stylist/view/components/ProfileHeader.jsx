import { useEffect, useState } from 'react';

import { Avatar, Box, Chip, Divider, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { brand } from 'src/sections/home/landing/theme';
import SurfaceCard from 'src/sections/home/landing/SurfaceCard';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';

// ----------------------------------------------------------------------

export default function ProfileHeader({ business }) {
  const [coverImageError, setCoverImageError] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);

  useEffect(() => {
    setCoverImageError(false);
    setAvatarImageError(false);
  }, [business?._id]);

  const coverImage = normalizeImageUrl(business.coverImage);

  return (
    <SurfaceCard sx={{ mb: 3, overflow: 'hidden' }}>
      {/* Cover image */}
      <Box
        sx={{
          height: { xs: 140, md: 190 },
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
          p: { xs: 3, md: 4 },
          position: 'relative',
          background: `linear-gradient(135deg, ${alpha(brand.green[400], 0.08)} 0%, ${alpha(brand.green[200], 0.05)} 100%)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 2, md: 3 } }}>
          {/* Avatar */}
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Avatar
              src={!avatarImageError ? normalizeImageUrl(business.image) : undefined}
              slotProps={{ img: { onError: () => setAvatarImageError(true) } }}
              alt={business.businessName}
              sx={{
                width: { xs: 72, md: 88 },
                height: { xs: 72, md: 88 },
                border: 'solid 3px #fff',
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
                aria-label="Active stylist"
                sx={{
                  position: 'absolute',
                  right: { xs: 2, md: 4 },
                  bottom: { xs: 2, md: 4 },
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

          {/* Info */}
          <Box sx={{ flex: 1, minWidth: 0, pr: { xs: 10, md: 14 } }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '1.4rem', md: '1.75rem' } }}>
              {business.businessName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7, maxWidth: 560 }}>
              {business.description}
            </Typography>

            {/* Stats row */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 0 },
                rowGap: 1,
                border: (t) => `1px solid ${t.palette.divider}`,
                borderRadius: 2.5,
                bgcolor: (t) => alpha(t.palette.background.paper, 0.6),
                px: 1.75,
                py: 1.1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, pr: { xs: 1.25, sm: 1.75 } }}>
                <Iconify icon="mingcute:star-fill" width={16} sx={{ color: '#F59E0B', flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'text.primary', lineHeight: 1 }}>
                  {Number(business.rating?.avgRating || 0).toFixed(1)}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, my: 0.25 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: { xs: 1.25, sm: 1.75 } }}>
                <Iconify icon="mingcute:chat-3-fill" width={14} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  {business.rating?.totalReviews ?? 0} reviews
                </Typography>
              </Box>

              {business.businessType && (
                <>
                  <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, my: 0.25 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: { xs: 1.25, sm: 1.75 } }}>
                    <Iconify
                      icon={business.businessType === 'team' ? 'mingcute:group-2-fill' : 'mingcute:user-1-fill'}
                      width={14}
                      sx={{ color: 'text.disabled', flexShrink: 0 }}
                    />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {business.businessType === 'team' ? 'Team' : 'Solo'}
                    </Typography>
                  </Box>
                </>
              )}

              {String(business.certifications?.status || '').toLowerCase() === 'approved' && (
                <Chip
                  icon={<Iconify icon="solar:shield-check-bold" width={13} sx={{ color: brand.green[600] }} />}
                  label="Licensed Professional"
                  size="small"
                  sx={{
                    ml: { xs: 0, sm: 'auto' },
                    bgcolor: alpha(brand.green[400], 0.12),
                    color: brand.green[800],
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    border: `1px solid ${alpha(brand.green[400], 0.3)}`,
                    pointerEvents: 'none',
                    '& .MuiChip-label': { px: 0.75 },
                    '& .MuiChip-icon': { ml: 0.5, mr: -0.25 },
                  }}
                />
              )}
            </Box>

            {business.categories?.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
                {business.categories.map((cat) => (
                  <Chip
                    key={cat._id}
                    label={cat.name}
                    size="small"
                    sx={{
                      bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
                      color: 'text.primary',
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      pointerEvents: 'none',
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </SurfaceCard>
  );
}
