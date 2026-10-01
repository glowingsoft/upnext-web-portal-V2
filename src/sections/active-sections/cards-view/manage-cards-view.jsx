import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { varAlpha } from 'src/theme/styles';

import { PaymentCardTile } from './payment-card-tile';

// ----------------------------------------------------------------------

const GRID_COLUMNS = { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' };

function AddCardTile({ onClick }) {
  const { t } = useTranslate();

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 3,
        minHeight: 160 + 45,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        cursor: 'pointer',
        border: (theme) => `1.5px dashed ${varAlpha(theme.vars.palette.primary.mainChannel, 0.32)}`,
        bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
        boxShadow: 'none',
        transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
        '&:hover': {
          bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
          borderColor: 'primary.main',
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
          color: 'primary.main',
        }}
      >
        <Iconify icon="mingcute:add-line" width={22} />
      </Box>
      <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
        {t('addCard')}
      </Typography>
    </Card>
  );
}

function CardTileSkeleton() {
  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" sx={{ minHeight: 160 }} />
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.25 }}>
        <Skeleton variant="rounded" width={64} height={24} />
        <Stack direction="row" spacing={0.5}>
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </Stack>
      </Stack>
    </Card>
  );
}

export function ManageCardsView({ cards = [], loading = false, onAddCard, onEditCard, onDeleteCard }) {
  const { t } = useTranslate();
  const [searchValue, setSearchValue] = useState('');

  const filteredCards = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) return cards;

    return cards.filter((card) => [card.cardHolderName, card.cardNumber, card.expiryDate].filter(Boolean).join(' ').toLowerCase().includes(query));
  }, [cards, searchValue]);

  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder={t('searchCardsPlaceholder')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 420, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
      />

      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: GRID_COLUMNS, gap: 3 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <CardTileSkeleton key={i} />
          ))}
        </Box>
      ) : filteredCards.length > 0 ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: GRID_COLUMNS, gap: 3 }}>
          {filteredCards.map((card) => (
            <PaymentCardTile key={card.id} card={card} onEdit={onEditCard} onDelete={onDeleteCard} />
          ))}
          <AddCardTile onClick={onAddCard} />
        </Box>
      ) : searchValue.trim() ? (
        <Card
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            border: (theme) => `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ maxWidth: 480, mx: 'auto' }}>
            <Iconify icon="solar:magnifer-zoom-out-bold" width={48} sx={{ color: 'text.disabled' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('noCardsMatching', { search: searchValue.trim() })}
            </Typography>
          </Stack>
        </Card>
      ) : (
        <Card
          onClick={onAddCard}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 3,
            cursor: 'pointer',
            textAlign: 'center',
            border: (theme) => `1.5px dashed ${varAlpha(theme.vars.palette.primary.mainChannel, 0.32)}`,
            bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
            boxShadow: 'none',
            '&:hover': { bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08) },
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
                color: 'primary.main',
              }}
            >
              <Iconify icon="solar:card-bold" width={30} />
            </Box>
            <Stack spacing={0.5}>
              <Typography variant="h6">{t('noCardsSavedYet')}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('addFirstCardPrompt')}
              </Typography>
            </Stack>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
