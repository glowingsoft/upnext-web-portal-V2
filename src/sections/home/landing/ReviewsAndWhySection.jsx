import { useEffect, useRef, useState } from 'react';

import { Avatar, Box, Grid, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Logo } from 'src/components/logo';

import SurfaceCard from './SurfaceCard';
import { CUSTOMER_REVIEWS } from './data';
import { brand } from './theme';

const STATS = [
  { end: 500, suffix: '+', label: 'Providers' },
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
        py: 2.5,
        textAlign: 'center',
        borderRight: !isLast ? `1px solid ${alpha(brand.green[400], 0.18)}` : 'none',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          lineHeight: 1,
          color: brand.green[600],
          fontVariantNumeric: 'lining-nums',
          fontSize: { xs: '1.6rem', sm: '1.6rem', md: '1.6rem', lg: '1.75rem' },
        }}
      >
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
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(brand.green[400], 0.2)}`,
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          borderColor: alpha(brand.green[400], 0.5),
          boxShadow: `0 24px 48px -28px ${alpha(brand.green[800], 0.35)}`,
        },
      }}
    >
      <Typography
        aria-hidden
        variant="h1"
        sx={{
          position: 'absolute',
          top: { xs: -6, md: -10 },
          right: { xs: 16, md: 28 },
          fontWeight: 700,
          lineHeight: 1,
          fontSize: { xs: '5rem', sm: '5rem', md: '7rem', lg: '7rem' },
          color: alpha(brand.green[400], 0.16),
          userSelect: 'none',
        }}
      >
        &rdquo;
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, mb: 1.75 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Iconify key={index} icon="mingcute:star-fill" width={16} sx={{ color: '#F59E0B' }} />
        ))}
      </Box>

      <Typography sx={{ mb: 2.5, maxWidth: 640, color: 'text.primary', lineHeight: 1.8, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
        {item.text}
      </Typography>

      <Box
        sx={{
          pt: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderTop: `1px solid ${alpha(brand.green[400], 0.18)}`,
        }}
      >
        <Avatar
          sx={{
            width: 42,
            height: 42,
            flexShrink: 0,
            bgcolor: alpha(brand.green[400], 0.14),
            color: brand.green[600],
            fontWeight: 700,
          }}
        >
          {item.name[0]}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.4 }}>
            {item.name}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.4 }}>
            {item.city}
            {item.date ? ` · ${item.date}` : ''}
          </Typography>
        </Box>
        <Box
          sx={{
            px: 1.25,
            py: 0.4,
            borderRadius: 99,
            flexShrink: 0,
            fontSize: '0.67rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: brand.green[600],
            bgcolor: alpha(brand.green[400], 0.1),
            border: `1px solid ${alpha(brand.green[400], 0.25)}`,
          }}
        >
          APPROVED
        </Box>
      </Box>
    </Box>
  );
}

export default function ReviewsAndWhySection({ onJoinAsProvider }) {
  return (
    <Grid id="reviews" container spacing={3} sx={{ mt: 0, px: { xs: 2, sm: 4, md: 6, lg: 8 }, py: { xs: 5, md: 8 }, scrollMarginTop: '92px' }}>

      {/* Left — Reviews */}
      <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: { xs: 2.5, md: 3 } }}>
          {CUSTOMER_REVIEWS.map((item) => (
            <ReviewItem key={item.name} item={item} />
          ))}
        </Box>
      </Grid>

      {/* Right — Become a Provider */}
      <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
        <SurfaceCard
          sx={{
            overflow: 'hidden',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: `1px solid ${alpha(brand.green[400], 0.2)}`,
          }}
        >

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
              { bottom: '8%', right: '8%', size: 14 },
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

            <Typography
              variant="h4"
              sx={{
                position: 'relative',
                zIndex: 1,
                fontWeight: 700,
                color: '#fff',
                textAlign: 'center',
                fontSize: { xs: '1.5rem', sm: '1.5rem', md: '1.5rem', lg: '1.6rem' },
              }}
            >
              Grow with UpNext
            </Typography>
            <Typography sx={{ position: 'relative', zIndex: 1, color: alpha('#fff', 0.7), textAlign: 'center', mt: 0.75, fontSize: '0.85rem' }}>
              Join thousands of professionals already on the platform
            </Typography>
          </Box>

          {/* Stats row — count-up animation */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderBottom: `1px solid ${alpha(brand.green[400], 0.18)}`,
              flexShrink: 0,
            }}
          >
            {STATS.map((stat, i) => (
              <StatCell key={stat.label} stat={stat} isLast={i === STATS.length - 1} />
            ))}
          </Box>

          {/* CTA content */}
          <Box sx={{ p: { xs: 2.5, md: 3.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.4rem', sm: '1.4rem', md: '1.4rem', lg: '1.5rem' } }}>
              Become a Provider
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.8, fontSize: '0.95rem' }}>
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
                px: 3.5,
                py: 1.6,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                backgroundColor: brand.green[400],
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: `0 8px 20px ${alpha(brand.green[400], 0.35)}`,
                transition: 'background-color 0.18s ease',
                '&:hover': { backgroundColor: brand.green[600] },
              }}
            >
              Join as Provider
            </Box>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column' }}>
              {[
                { icon: 'solar:lock-bold', title: 'Secure Payments', desc: 'Every transaction is protected end-to-end' },
                { icon: 'solar:calendar-mark-bold', title: 'Flexible Schedule', desc: 'Set your own hours and manage availability from anywhere' },
                { icon: 'mingcute:gift-line', title: 'Free to Join', desc: 'No upfront fees — only a small commission per completed booking' },
              ].map((feat) => (
                <Box
                  key={feat.title}
                  sx={{
                    py: 2,
                    borderTop: `1px solid ${alpha(brand.green[400], 0.18)}`,
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
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary', lineHeight: 1.3 }}>
                      {feat.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.5, mt: 0.25, fontSize: '0.85rem' }}>
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
