import { brand } from 'src/sections/home/landing/theme';

export const authHeadingSx = {
  fontWeight: 700,
  lineHeight: 1.2,
  fontSize: { xs: '1.6rem', sm: '1.75rem', md: '1.9rem', lg: '1.9rem' },
};

export const authFieldSx = {
  '& .MuiOutlinedInput-root:not(.Mui-error):hover .MuiOutlinedInput-notchedOutline': {
    borderColor: brand.green[400],
  },
  '& .MuiOutlinedInput-root.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
    borderColor: brand.green[400],
  },
  '& .MuiInputLabel-root.Mui-focused:not(.Mui-error)': {
    color: brand.green[600],
  },
};
