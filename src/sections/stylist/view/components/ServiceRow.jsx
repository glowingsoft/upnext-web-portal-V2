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
          py: 2.5,
          gap: 2,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover .svc-name': { color: brand.green[600] },
          '&:hover .svc-arrow': { borderColor: brand.green[400] },
        }}
      >
        {/* Left — name + chips */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography className="svc-name" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.4, mb: 1, transition: 'color 0.15s ease' }}>
            {service.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            <Chip
              icon={<Iconify icon="solar:clock-circle-bold" width={12} sx={{ color: 'inherit' }} />}
              label={service.duration}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.72rem',
                fontWeight: 600,
                color: brand.green[800],
                bgcolor: alpha(brand.green[400], 0.06),
                border: `1px solid ${alpha(brand.green[400], 0.35)}`,
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
                  height: 24,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  bgcolor: 'transparent',
                  border: `1px solid ${alpha(brand.green[400], 0.25)}`,
                  pointerEvents: 'none',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
          </Box>
        </Box>

        {/* Right — price + expand arrow */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: 'text.primary', lineHeight: 1 }}>${service.price}</Typography>
          <Box
            className="svc-arrow"
            sx={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isExpanded ? '#fff' : brand.green[600],
              bgcolor: isExpanded ? brand.green[400] : 'transparent',
              border: `1px solid ${isExpanded ? brand.green[400] : alpha(brand.green[400], 0.5)}`,
              transition: 'background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease',
            }}
          >
            <Iconify
              icon="mingcute:arrow-right-line"
              width={16}
              sx={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }}
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
            <PolicyInfo icon="solar:shield-user-bold" label="Service Type" value={service.serviceType || '—'} />
            <PolicyInfo icon="mingcute:calendar-line" label="Availability" value={service.availability || '—'} />
            <PolicyInfo icon="solar:clock-circle-bold" label="Book by" value={service.bookByLabel || '—'} />
            <PolicyInfo icon="mingcute:close-line" label="Cancel by" value={service.cancelByLabel || '—'} />
            <PolicyInfo icon="solar:wallet-money-bold" label="Refund" value={service.refundPercentage != null ? `${service.refundPercentage}%` : '—'} />
          </Box>

          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontStyle: 'italic', mb: 2.5, fontSize: '0.78rem' }}>
            {service.refundPercentage != null
              ? `${service.refundPercentage}% refund available depending on cancellation timing.`
              : 'Booking policy details coming soon.'}
          </Typography>

          {showBook && (
            <Box
              component="button"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onBook();
              }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 3.5,
                py: 1.4,
                borderRadius: 99,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                backgroundColor: brand.green[400],
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                boxShadow: `0 8px 20px ${alpha(brand.green[400], 0.35)}`,
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

      {!isLast && !isExpanded && <Divider sx={{ borderColor: alpha(brand.green[400], 0.18) }} />}
    </>
  );
}
