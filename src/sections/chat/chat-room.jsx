import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { useBoolean } from 'src/hooks/use-boolean';
import { useTranslate } from 'src/locales/use-locales';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { CollapseButton } from './styles';
import { ChatRoomSkeleton } from './chat-skeleton';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;
const NAV_DRAWER_WIDTH = 320;

const AVATAR_SIZE = 96;
const DOT_SIZE = 16;

const BOOKING_STATUS_COLOR = {
  requested: 'warning',
  scheduled: 'info',
  ongoing: 'primary',
  completed: 'success',
  expired: 'default',
  canceled: 'error',
};

export function ChatRoom({ collapseNav, otherUser, bookings = [], loading }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const collapseBookings = useBoolean(true);

  const { collapseDesktop, openMobile, onCloseMobile } = collapseNav;

  const isOnline = !!otherUser?.isOnline;

  const renderContent = loading ? (
    <ChatRoomSkeleton />
  ) : (
    <Stack sx={{ height: 1, minHeight: 0 }}>
      <Stack
        alignItems="center"
        sx={{
          pt: 5,
          pb: 3,
          px: 2.5,
          flexShrink: 0,
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0)} 100%)`,
        }}
      >
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Avatar
            src={otherUser?.avatarUrl}
            alt={otherUser?.name}
            sx={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              border: `solid 3px ${theme.palette.background.paper}`,
              boxShadow: theme.customShadows?.z8,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              right: 4,
              bottom: 4,
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: '50%',
              bgcolor: isOnline ? 'success.main' : 'text.disabled',
              border: `solid 2.5px ${theme.palette.background.paper}`,
            }}
          />
        </Box>

        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {otherUser?.name || '—'}
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{
            mt: 0.75,
            px: 1.25,
            py: 0.5,
            borderRadius: 99,
            bgcolor: isOnline ? alpha(theme.palette.success.main, 0.12) : alpha(theme.palette.text.disabled, 0.12),
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: isOnline ? 'success.main' : 'text.disabled',
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 600, color: isOnline ? 'success.dark' : 'text.secondary' }}>
            {isOnline ? t('activeNow') : t('offline')}
          </Typography>
        </Stack>
      </Stack>

      {bookings.length > 0 && (
        <>
          <Divider sx={{ borderStyle: 'dashed', flexShrink: 0 }} />

          <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
            <CollapseButton selected={collapseBookings.value} onClick={collapseBookings.onToggle}>
              {t('chatBookingsCount', { count: bookings.length })}
            </CollapseButton>

            <Collapse in={collapseBookings.value}>
              <Stack spacing={1.5} sx={{ px: 2.5, py: 1.5 }}>
                {bookings.map((booking) => (
                  <Stack
                    key={booking._id}
                    spacing={1}
                    sx={{
                      px: 1.5,
                      py: 1.25,
                      borderRadius: 1.5,
                      border: `1px solid ${theme.vars.palette.divider}`,
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1.25}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          flexShrink: 0,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                          color: 'primary.main',
                        }}
                      >
                        <Iconify icon="solar:calendar-bold" width={16} />
                      </Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, wordBreak: 'break-word', pt: 0.25 }}>
                        {booking.name || t('booking')}
                      </Typography>
                    </Stack>

                    <Label
                      variant="soft"
                      color={BOOKING_STATUS_COLOR[booking.status] ?? 'default'}
                      sx={{ alignSelf: 'flex-start', ml: '38px', textTransform: 'capitalize' }}
                    >
                      {t(booking.status)}
                    </Label>
                  </Stack>
                ))}
              </Stack>
            </Collapse>
          </Scrollbar>
        </>
      )}
    </Stack>
  );

  return (
    <>
      <Stack
        sx={{
          minHeight: 0,
          flex: '1 1 auto',
          width: NAV_WIDTH,
          display: { xs: 'none', lg: 'flex' },
          borderLeft: `solid 1px ${theme.vars.palette.divider}`,
          transition: theme.transitions.create(['width'], {
            duration: theme.transitions.duration.shorter,
          }),
          ...(collapseDesktop && { width: 0 }),
        }}
      >
        {!collapseDesktop && renderContent}
      </Stack>

      <Drawer
        anchor="right"
        open={openMobile}
        onClose={onCloseMobile}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: NAV_DRAWER_WIDTH } }}
      >
        {renderContent}
      </Drawer>
    </>
  );
}
