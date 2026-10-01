import { memo } from 'react';

import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { brand } from './theme';

// ----------------------------------------------------------------------

const FilterPill = memo(function FilterPill({ icon, value, defaultValue, onChange, options }) {
  const isActive = value !== defaultValue;
  const selected = options.find((opt) => opt.value === value);

  return (
    <FormControl
      size="small"
      sx={{
        flexShrink: 0,
        maxWidth: 220,
        '& .MuiOutlinedInput-root': {
          borderRadius: 50,
          height: 40,
          bgcolor: isActive ? alpha(brand.green[400], 0.08) : '#fff',
          transition: 'background-color 0.18s ease',
          '& fieldset': {
            borderColor: isActive ? brand.green[400] : 'rgba(145,158,171,0.24)',
            borderWidth: '1.5px',
          },
          '&:hover fieldset': { borderColor: brand.green[400] },
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            py: '0 !important',
            pl: '12px',
            pr: '28px !important',
          },
          '& .MuiSelect-icon': {
            color: isActive ? brand.green[600] : 'text.disabled',
            right: 6,
          },
        },
      }}
    >
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
        MenuProps={{
          disableScrollLock: true,
          PaperProps: {
            sx: {
              mt: 0.75,
              maxHeight: 320,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
              border: '1px solid rgba(145,158,171,0.16)',
            },
          },
        }}
        renderValue={() => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Iconify icon={icon} width={15} sx={{ color: isActive ? brand.green[600] : 'text.secondary', flexShrink: 0 }} />
            <Typography
              variant="body2"
              noWrap
              sx={{ color: isActive ? brand.green[700] : 'text.primary', fontWeight: isActive ? 700 : 400, fontSize: '0.825rem' }}
            >
              {selected?.label ?? value}
            </Typography>
          </Box>
        )}
      >
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <MenuItem
              key={opt.value}
              value={opt.value}
              sx={{
                fontSize: '0.875rem',
                justifyContent: 'space-between',
                gap: 1.5,
                color: isSelected ? brand.green[700] : 'text.primary',
                fontWeight: isSelected ? 700 : 400,
                bgcolor: isSelected ? alpha(brand.green[400], 0.08) : 'transparent',
                '&:hover': { bgcolor: alpha(brand.green[400], 0.06) },
                '&.Mui-selected': { bgcolor: alpha(brand.green[400], 0.08) },
                '&.Mui-selected:hover': { bgcolor: alpha(brand.green[400], 0.12) },
              }}
            >
              {opt.label}
              {isSelected && <Iconify icon="mingcute:check-line" width={16} sx={{ color: brand.green[600], flexShrink: 0 }} />}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
});

export default FilterPill;
