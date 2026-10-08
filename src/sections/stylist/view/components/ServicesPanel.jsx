import { Box, Chip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { brand } from 'src/sections/home/landing/theme';
import SurfaceCard from 'src/sections/home/landing/SurfaceCard';

import ServiceRow from './ServiceRow';

// ----------------------------------------------------------------------

function StatTile({ icon, label, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        border: `1px solid ${alpha(brand.green[400], 0.22)}`,
        bgcolor: alpha(brand.green[400], 0.05),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Iconify icon={icon} width={13} sx={{ color: brand.green[600], flexShrink: 0 }} />
        <Typography variant="caption" sx={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary' }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, color: 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

export default function ServicesPanel({
  business,
  categories,
  selectedCategory,
  onCategoryChange,
  filteredServices,
  expandedServiceId,
  onToggleService,
  onBookService,
  showBook,
}) {
  const hasQuickFacts =
    business.businessType || business.yearsOfExperience != null || business.priceRange?.min > 0 || business.priceRange?.max > 0 || business.skills?.length > 0;

  return (
    <SurfaceCard sx={{ p: 0, overflow: 'hidden', borderRadius: 3, border: `1px solid ${alpha(brand.green[400], 0.2)}` }}>
      {/* Quick facts */}
      {hasQuickFacts && (
        <Box sx={{ px: 3, pt: 3, pb: 3, borderBottom: `1px solid ${alpha(brand.green[400], 0.18)}` }}>
          <Box
            sx={{
              display: { xs: 'grid', sm: 'flex' },
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              flexWrap: 'wrap',
              gap: 1.5,
              mb: business.skills?.length ? 2.5 : 0,
            }}
          >
            {business.businessType && (
              <StatTile
                icon={business.businessType === 'team' ? 'mingcute:group-2-fill' : 'mingcute:user-1-fill'}
                label="Business Type"
                value={business.businessType === 'team' ? 'Team' : 'Solo'}
              />
            )}

            {business.yearsOfExperience != null && (
              <StatTile
                icon="solar:medal-star-bold"
                label="Experience"
                value={`${business.yearsOfExperience} yr${business.yearsOfExperience === 1 ? '' : 's'} experience`}
              />
            )}

            {business.businessType === 'team' && business.teamSize > 0 && (
              <StatTile icon="mingcute:group-2-fill" label="Team Size" value={`${business.teamSize} team member${business.teamSize === 1 ? '' : 's'}`} />
            )}

            {(business.priceRange?.min > 0 || business.priceRange?.max > 0) && (
              <StatTile
                icon="solar:tag-price-bold"
                label="Pricing"
                value={
                  business.priceRange.min === business.priceRange.max
                    ? `$${business.priceRange.min}`
                    : `$${business.priceRange.min} – $${business.priceRange.max}`
                }
              />
            )}
          </Box>

          {business.skills?.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                sx={{ display: 'block', mb: 1, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary' }}
              >
                Specialities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {business.skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    sx={{
                      height: 26,
                      bgcolor: alpha(brand.green[400], 0.06),
                      border: `1px solid ${alpha(brand.green[400], 0.35)}`,
                      color: brand.green[800],
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      pointerEvents: 'none',
                      '& .MuiChip-label': { px: 1.25 },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Services header */}
      <Box sx={{ px: 3, pt: 3, pb: 0, borderBottom: `1px solid ${alpha(brand.green[400], 0.18)}` }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{ mb: 0.5, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.5rem', md: '1.75rem', lg: '1.75rem' } }}
            >
              Services
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
              Select a category then choose your service to book.
            </Typography>
          </Box>
          <Chip
            label={`${business.services?.items?.length ?? 0} services`}
            size="small"
            sx={{
              mt: 0.5,
              flexShrink: 0,
              height: 26,
              fontWeight: 700,
              fontSize: '0.72rem',
              color: brand.green[800],
              bgcolor: alpha(brand.green[400], 0.06),
              border: `1px solid ${alpha(brand.green[400], 0.35)}`,
              pointerEvents: 'none',
              '& .MuiChip-label': { px: 1.25 },
            }}
          />
        </Box>

        {(business.services?.items?.length ?? 0) > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pb: 2.5 }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat._id;
            return (
              <Box
                key={cat._id}
                component="button"
                type="button"
                onClick={() => onCategoryChange(cat._id)}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.75,
                  py: 0.7,
                  borderRadius: 99,
                  border: `1px solid ${isActive ? brand.green[400] : alpha(brand.green[400], 0.35)}`,
                  bgcolor: isActive ? brand.green[400] : 'transparent',
                  color: isActive ? '#fff' : 'text.secondary',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease',
                  '&:hover': {
                    borderColor: brand.green[400],
                    color: isActive ? '#fff' : brand.green[600],
                  },
                }}
              >
                {cat.name}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 17,
                    height: 17,
                    borderRadius: '50%',
                    bgcolor: isActive ? alpha('#fff', 0.25) : alpha('#000', 0.07),
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {cat.count}
                </Box>
              </Box>
            );
          })}
        </Box>
        )}
      </Box>

      {/* Service list */}
      <Box sx={{ px: 3 }}>
        {filteredServices.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: alpha(brand.green[400], 0.1),
                border: `1.5px solid ${alpha(brand.green[400], 0.25)}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Iconify icon="mingcute:calendar-2-line" width={24} sx={{ color: brand.green[600] }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              No services yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, mx: 'auto', lineHeight: 1.7 }}>
              {categories.length > 1 && selectedCategory !== 'all'
                ? 'No services in this category yet — try a different one.'
                : 'This stylist hasn’t added any bookable services yet.'}
            </Typography>
          </Box>
        ) : (
          filteredServices.map((service, index) => (
            <ServiceRow
              key={service._id}
              service={service}
              isExpanded={expandedServiceId === service._id}
              onToggle={() => onToggleService(service._id)}
              onBook={() => onBookService(service)}
              isLast={index === filteredServices.length - 1}
              showBook={showBook}
            />
          ))
        )}
      </Box>
    </SurfaceCard>
  );
}
