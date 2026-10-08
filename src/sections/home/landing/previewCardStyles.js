import { alpha } from '@mui/material/styles';

import { brand } from './theme';

export const previewCardSx = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  cursor: 'pointer',
  borderRadius: 3,
  bgcolor: 'background.paper',
  border: `1px solid ${alpha(brand.green[400], 0.2)}`,
  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: alpha(brand.green[400], 0.5),
    boxShadow: `0 24px 48px -24px ${alpha(brand.green[800], 0.35)}`,
  },
  '&:hover .preview-card-image': { transform: 'scale(1.05)' },
  '&:hover .preview-card-arrow': { bgcolor: brand.green[400], color: '#fff', borderColor: brand.green[400] },
  '&:focus-visible': { outline: `2px solid ${brand.green[400]}`, outlineOffset: 2 },
};

export const previewBadgeSx = {
  position: 'absolute',
  top: 12,
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1.25,
  py: 0.5,
  borderRadius: 99,
  fontSize: '0.72rem',
  fontWeight: 700,
  lineHeight: 1.4,
  color: 'text.primary',
  bgcolor: alpha('#fff', 0.92),
  backdropFilter: 'blur(6px)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
};

export const previewFooterSx = {
  pt: 1.5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  borderTop: `1px solid ${alpha(brand.green[400], 0.18)}`,
};

export const previewLinkSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.75,
  flexShrink: 0,
  p: 0,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: brand.green[600],
};

export const previewArrowSx = {
  width: 34,
  height: 34,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: brand.green[600],
  border: `1px solid ${alpha(brand.green[400], 0.5)}`,
  transition: 'background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease',
};

export const getInitial = (text) => (String(text || '').trim().charAt(0) || '?').toUpperCase();

export const previewOverlineSx = {
  fontSize: '0.7rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'text.disabled',
};
