import { Box, Chip, Collapse, Divider, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { brand } from 'src/sections/home/landing/theme';

// ----------------------------------------------------------------------

function PolicyInfo({ icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Iconify icon={icon} width={12} sx={{ color: brand.green[600], flexShrink: 0 }} />
        <Typography variant="caption" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, color: 'text.secondary' }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

export default function ServiceRow({ service, isExpanded, onToggle, onBook, isLast, showBook }) {
  return (
    <>
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          gap: 2,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover .svc-name': { color: 'primary.main' },
        }}
      >
        {/* Left — name + chips */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography className="svc-name" variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, transition: 'color 0.15s ease' }}>
            {service.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            <Chip
              icon={<Iconify icon="solar:clock-circle-bold" width={12} sx={{ color: 'inherit' }} />}
              label={service.duration}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'text.primary',
                bgcolor: (t) => alpha(t.palette.text.primary, 0.07),
                pointerEvents: 'none',
                '& .MuiChip-label': { px: 0.75 },
                '& .MuiChip-icon': { ml: 0.5, mr: -0.25 },
              }}
            />
            {service.subCategory && (
              <Chip
                label={service.subCategory}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  bgcolor: (t) => alpha(t.palette.text.primary, 0.07),
                  pointerEvents: 'none',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
          </Box>
        </Box>

        {/* Right — price + expand arrow */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: brand.green[600], lineHeight: 1 }}>${service.price}</Typography>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isExpanded ? alpha(brand.green[400], 0.12) : alpha('#000', 0.04),
              transition: 'background-color 0.18s ease',
            }}
          >
            <Iconify
              icon="mingcute:arrow-right-line"
              width={14}
              sx={{
                color: isExpanded ? brand.green[600] : 'text.secondary',
                transform: isExpanded ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.2s ease, color 0.15s ease',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Expanded policy panel */}
      <Collapse in={isExpanded} unmountOnExit>
        <Box
          sx={{
            mx: -3,
            px: 3,
            py: 2.5,
            bgcolor: alpha(brand.green[400], 0.04),
            borderTop: `1px solid ${alpha(brand.green[400], 0.14)}`,
            borderBottom: `1px solid ${alpha(brand.green[400], 0.14)}`,
            mb: 2,
          }}
        >
          {/* Policy grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
              gap: 2,
              mb: 2,
            }}
          >
            <PolicyInfo icon="solar:shield-user-bold" label="Service Type" value={service.serviceType || '—'} />
            <PolicyInfo icon="mingcute:calendar-line" label="Availability" value={service.availability || '—'} />
            <PolicyInfo icon="solar:clock-circle-bold" label="Book by" value={service.bookByLabel || '—'} />
            <PolicyInfo icon="mingcute:close-line" label="Cancel by" value={service.cancelByLabel || '—'} />
            <PolicyInfo icon="solar:wallet-money-bold" label="Refund" value={service.refundPercentage != null ? `${service.refundPercentage}%` : '—'} />
          </Box>

          {/* Refund rule */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'text.secondary',
              fontStyle: 'italic',
              mb: 2.5,
              fontSize: '0.78rem',
            }}
          >
            {service.refundPercentage != null
              ? `${service.refundPercentage}% refund available depending on cancellation timing.`
              : 'Booking policy details coming soon.'}
          </Typography>

          {/* Book CTA */}
          {showBook && (
            <Box
              component="button"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBook();
              }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 3,
                py: 1,
                borderRadius: 99,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                backgroundColor: brand.green[400],
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: `0 3px 10px ${alpha(brand.green[400], 0.3)}`,
                transition: 'background-color 0.18s ease',
                '&:hover': { backgroundColor: brand.green[600] },
              }}
            >
              <Iconify icon="mingcute:calendar-line" width={15} />
              Book this service
            </Box>
          )}
        </Box>
      </Collapse>

      {!isLast && !isExpanded && <Divider />}
    </>
  );
}
