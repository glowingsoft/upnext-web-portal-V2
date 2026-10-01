import { useState } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

import { FlagIcon, Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------

const DETAIL_ACCENT = '#b79a73';
const SCOPE_COLOR = { user: 'info', business: 'warning', both: 'secondary' };

const LANG_COUNTRY = { en: 'GB', es: 'ES', fr: 'FR', pt: 'PT', zh: 'CN', ar: 'SA', ht: 'HT' };
const LANG_NAME = { en: 'English', es: 'Spanish', fr: 'French', pt: 'Portuguese', zh: 'Chinese', ar: 'Arabic', ht: 'Haitian Creole' };

function InfoCard({ icon, label, value }) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: '#eadfc8',
        borderRadius: 2,
        px: 2,
        py: 1.75,
        bgcolor: '#fff7e6',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1.5,
        transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          bgcolor: '#fff3d8',
          borderColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.22),
          boxShadow: (theme) => `0 12px 26px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: '#efe5d1',
          boxShadow: (theme) => `0 4px 12px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.06)}`,
        }}
      >
        <Iconify icon={icon} width={17} sx={{ color: DETAIL_ACCENT }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="overline" sx={{ color: DETAIL_ACCENT, fontWeight: 900, letterSpacing: 1.2, lineHeight: 1, display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 900, lineHeight: 1.3, mt: 0.25 }}>
          {value ?? '—'}
        </Typography>
      </Box>
    </Box>
  );
}

function TranslationCard({ lang, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.5,
        py: 1.25,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: '#eadfc8',
        bgcolor: '#fff7e6',
        transition: 'background-color 0.2s ease, transform 0.2s ease',
        '&:hover': { bgcolor: '#fff3d8', transform: 'translateY(-1px)' },
      }}
    >
      <FlagIcon code={LANG_COUNTRY[lang]} sx={{ width: 24, height: 18, flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="overline" sx={{ color: DETAIL_ACCENT, fontWeight: 900, letterSpacing: 1, lineHeight: 1, display: 'block', fontSize: 9 }}>
          {LANG_NAME[lang] || lang.toUpperCase()}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, mt: 0.25, wordBreak: 'break-word' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function TranslationsGrid({ translations }) {
  const entries = Object.entries(translations || {}).filter(([, value]) => value);

  if (entries.length === 0) return null;

  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }} gap={1.25}>
      {entries.map(([lang, value]) => (
        <TranslationCard key={lang} lang={lang} value={value} />
      ))}
    </Box>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
        }}
      >
        <Iconify icon={icon} width={16} sx={{ color: 'primary.main' }} />
      </Box>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
    </Stack>
  );
}

function HeroIcon({ icon, name }) {
  const [imgError, setImgError] = useState(false);
  const isRealImage = icon && icon.startsWith('http') && !imgError;

  return (
    <Box
      sx={{
        width: 56,
        height: 56,
        flexShrink: 0,
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(120,120,120,0.35)',
        border: '1px solid rgba(255,255,255,0.3)',
      }}
    >
      {isRealImage ? (
        <Box component="img" src={icon} alt="" onError={() => setImgError(true)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <Typography sx={{ color: 'common.white', fontWeight: 800, fontSize: 22 }}>{(name || '?').charAt(0).toUpperCase()}</Typography>
      )}
    </Box>
  );
}

export function CategoriesDetailDialog({ open, onClose, category }) {
  if (!category) return null;

  const translations = category.translations || {};
  const categoryName = translations.en || category.name || '—';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      {/* Hero header */}
      <Box
        sx={{
          position: 'relative',
          px: 3,
          py: 3,
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        }}
      >
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12, color: 'common.white', bgcolor: 'rgba(255,255,255,0.12)', '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } }}
        >
          <Iconify icon="mingcute:close-line" width={18} />
        </IconButton>

        <Stack direction="row" alignItems="center" spacing={2}>
          <HeroIcon icon={category.icon} name={categoryName} />

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap sx={{ color: 'common.white', fontWeight: 800 }}>
              {categoryName}
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }}>
              {category.scope && (
                <Label variant="filled" color={SCOPE_COLOR[category.scope] || 'default'} sx={{ textTransform: 'capitalize' }}>
                  {category.scope}
                </Label>
              )}
              <Label variant="filled" color={category.status === 'active' ? 'success' : 'error'}>
                {category.status}
              </Label>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
            <InfoCard
              icon="solar:palette-bold"
              label="Color"
              value={
                category.color ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 14, height: 14, borderRadius: '4px', bgcolor: category.color, border: '1px solid', borderColor: 'divider' }} />
                    <Typography component="span" sx={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 900 }}>
                      {category.color}
                    </Typography>
                  </Stack>
                ) : null
              }
            />
            <InfoCard icon="solar:sort-bold" label="Sort Order" value={category.sortOrder ?? '—'} />
          </Box>

          {Object.keys(translations).length > 0 && (
            <Stack spacing={1.5}>
              <SectionHeader icon="solar:global-bold" title="Translations" />
              <TranslationsGrid translations={translations} />
            </Stack>
          )}

        </Stack>
      </DialogContent>
    </Dialog>
  );
}
