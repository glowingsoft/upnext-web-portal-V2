import { useEffect, useRef, useState } from 'react';

import { Avatar, Box, Grid, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Logo } from 'src/components/logo';

import SurfaceCard from './SurfaceCard';
import { CUSTOMER_REVIEWS } from './data';
import { brand } from './theme';

const STATS = [
  { end: 500, suffix: '+', label: 'Stylists' },
  { end: 4.8, suffix: '★', label: 'Avg Rating', decimals: 1 },
  { end: 10, suffix: 'k+', label: 'Bookings' },
];

function useCountUp(end, { duration = 1400, decimals = 0, startOnView = true } = {}) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            setValue(parseFloat((eased * end).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(step);
            else setValue(end);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, decimals, startOnView]);

  return { value, ref };
}

function StatCell({ stat, isLast }) {
  const { value, ref } = useCountUp(stat.end, { decimals: stat.decimals ?? 0 });
  const display = stat.decimals ? value.toFixed(stat.decimals) : Math.floor(value);

  return (
    <Box
      ref={ref}
      sx={{
        py: 2,
        textAlign: 'center',
        borderRight: !isLast ? (theme) => `1px solid ${theme.palette.divider}` : 'none',
      }}
    >
      <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', lineHeight: 1, color: brand.green[600] }}>
        {display}{stat.suffix}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {stat.label}
      </Typography>
    </Box>
  );
}

function ReviewItem({ item }) {
  return (
    <SurfaceCard sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.25 }}>
        <Avatar
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            bgcolor: alpha(brand.green[400], 0.14),
            color: brand.green[600],
            fontWeight: 700,
          }}
        >
          {item.name[0]}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {item.name}
            </Typography>
            <Box
              sx={{
                px: 1.25,
                py: 0.3,
                borderRadius: 99,
                bgcolor: alpha(brand.green[400], 0.1),
                border: `1px solid ${alpha(brand.green[400], 0.25)}`,
                flexShrink: 0,
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: brand.green[600], fontSize: '0.67rem', letterSpacing: '0.05em' }}
              >
                APPROVED
              </Typography>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {item.city}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mb: 1 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Iconify key={index} icon="mingcute:star-fill" width={13} sx={{ color: '#F59E0B' }} />
        ))}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.7 }}>
        {item.text}
      </Typography>
      <Typography variant="caption" color="text.disabled">
        {item.date}
      </Typography>
    </SurfaceCard>
  );
}

export default function ReviewsAndWhySection({ onJoinAsProvider }) {
  return (
    <Grid id="reviews" container spacing={2} sx={{ mt: 0.5, pb: 2, px: { xs: 2, md: 3 }, scrollMarginTop: '92px' }}>

      {/* Left — Reviews */}
      <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, color: brand.green[600], flexShrink: 0 }}>
          Customer Reviews
        </Typography>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.5 }}>
          {CUSTOMER_REVIEWS.map((item) => (
            <ReviewItem key={item.name} item={item} />
          ))}
        </Box>
      </Grid>

      {/* Right — Become a Stylist */}
      <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, flexShrink: 0 }}>
          &nbsp;
        </Typography>
        <SurfaceCard sx={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Illustrated top section */}
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              px: 3,
              pt: 4,
              pb: 3,
              minHeight: 220,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(145deg, ${brand.ink[900]} 0%, ${brand.green[900]} 52%, ${brand.green[800]} 100%)`,
            }}
          >
            {/* Decorative blobs */}
            <Box sx={{ position: 'absolute', top: -28, right: -28, width: 120, height: 120, borderRadius: '50%', bgcolor: alpha(brand.green[400], 0.18) }} />
            <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, borderRadius: '50%', bgcolor: alpha(brand.green[200], 0.1) }} />
            <Box sx={{ position: 'absolute', top: '40%', left: '10%', width: 50, height: 50, borderRadius: '50%', bgcolor: alpha(brand.green[400], 0.1) }} />

            {/* Brand logo badge */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                px: 3,
                py: 1.75,
                borderRadius: 3,
                bgcolor: alpha(brand.green[400], 0.18),
                border: `1.5px solid ${alpha(brand.green[200], 0.3)}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                mb: 2,
              }}
            >
              <Logo width={110} height={34} disableLink />
            </Box>

            {/* Floating sparkles */}
            {[
              { top: '18%', left: '18%', size: 16 },
              { top: '22%', right: '20%', size: 12 },
              { bottom: '25%', right: '14%', size: 14 },
            ].map((pos, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  zIndex: 1,
                  ...pos,
                  opacity: 0.7,
                }}
              >
                <Iconify icon="mingcute:star-fill" width={pos.size} sx={{ color: brand.green[200] }} />
              </Box>
            ))}

            <Typography variant="h6" sx={{ position: 'relative', zIndex: 1, fontWeight: 800, color: '#fff', textAlign: 'center' }}>
              Grow with UpNext
            </Typography>
            <Typography variant="caption" sx={{ position: 'relative', zIndex: 1, color: alpha('#fff', 0.6), textAlign: 'center', mt: 0.5 }}>
              Join thousands of professionals already on the platform
            </Typography>
          </Box>

          {/* Stats row — count-up animation */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              flexShrink: 0,
            }}
          >
            {STATS.map((stat, i) => (
              <StatCell key={stat.label} stat={stat} isLast={i === STATS.length - 1} />
            ))}
          </Box>

          {/* CTA content */}
          <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>
              Become a Stylist
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7 }}>
              Set your own hours, build your client base, and get paid securely — all in one place.
            </Typography>
            <Box
              component="button"
              type="button"
              onClick={onJoinAsProvider}
              sx={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                px: 3.25,
                py: 1.25,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                backgroundColor: brand.green[400],
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                boxShadow: `0 4px 14px ${alpha(brand.green[400], 0.35)}`,
                '&:hover': { backgroundColor: brand.green[600] },
              }}
            >
              Join as Stylist
            </Box>

            <Box sx={{ mt: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.5 }}>
              {[
                { icon: 'solar:lock-bold', title: 'Secure Payments', desc: 'Every transaction is protected end-to-end' },
                { icon: 'solar:calendar-mark-bold', title: 'Flexible Schedule', desc: 'Set your own hours and manage availability from anywhere' },
                { icon: 'mingcute:gift-line', title: 'Free to Join', desc: 'No upfront fees — only a small commission per completed booking' },
              ].map((feat) => (
                <Box
                  key={feat.title}
                  sx={{
                    px: 2.5,
                    py: 2,
                    borderRadius: 2,
                    bgcolor: alpha(brand.green[400], 0.08),
                    border: `1px solid ${alpha(brand.green[400], 0.22)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.75,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      bgcolor: alpha(brand.green[400], 0.14),
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={feat.icon} width={22} sx={{ color: brand.green[600] }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brand.green[600], display: 'block', lineHeight: 1.3 }}>
                      {feat.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, mt: 0.25 }}>
                      {feat.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

        </SurfaceCard>
      </Grid>

    </Grid>
  );
}
