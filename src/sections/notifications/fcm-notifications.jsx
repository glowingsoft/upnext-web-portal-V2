import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onMessage } from 'firebase/messaging';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { selectUser } from 'src/store/slices/userSlice';
import { bookingsApi } from 'src/store/Reducer/bookings-api';
import { notificationsApi } from 'src/store/Reducer/notifications-api';
import { getFcmMessaging } from 'src/lib/firebase-messaging';
import { getNotificationTypeMeta } from 'src/utils/notification-type';

const isBookingNotification = (type, objectType) => objectType === 'booking' || /booking/i.test(type || '');
function FcmToast({ id, title, body, type }) {
  const typeMeta = getNotificationTypeMeta(type);

  const getTypeColor = (theme) => theme.palette[typeMeta.color]?.main || theme.palette.grey[500];

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        backdropFilter: 'blur(14px)',
        boxShadow: (theme) => theme.customShadows?.z24 || `0 12px 32px ${alpha(theme.palette.common.black, 0.18)}`,
        overflow: 'hidden',
        transition: 'all .2s ease',

        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.customShadows?.z24 || `0 18px 40px ${alpha(theme.palette.common.black, 0.22)}`,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: getTypeColor,
        }}
      />

      {/* Icon */}
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: (theme) => `linear-gradient(135deg, ${alpha(getTypeColor(theme), 0.22)}, ${alpha(getTypeColor(theme), 0.08)})`,
          border: (theme) => `1px solid ${alpha(getTypeColor(theme), 0.18)}`,
        }}
      >
        <Iconify icon={typeMeta.icon} width={18} sx={{ color: getTypeColor }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }} noWrap>
            {title}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, fontWeight: 500 }}>
            Just now
          </Typography>
        </Stack>

        {body && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.25,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {body}
          </Typography>
        )}
      </Box>

      {/* Close */}
      <IconButton
        size="small"
        onClick={() => toast.dismiss(id)}
        sx={{
          flexShrink: 0,
          width: 24,
          height: 24,
          color: 'text.disabled',
          '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
        }}
      >
        <Iconify icon="mingcute:close-line" width={16} />
      </IconButton>

      {/* Bottom Progress Accent */}
      <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, bgcolor: (theme) => alpha(getTypeColor(theme), 0.15) }}>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: getTypeColor,
            transformOrigin: 'left',
            animation: 'toast-progress 5s linear forwards',
            '@keyframes toast-progress': {
              from: { transform: 'scaleX(1)' },
              to: { transform: 'scaleX(0)' },
            },
          }}
        />
      </Box>
    </Box>
  );
}

// Main component that sets up FCM message listener and shows toast notifications

export function FcmNotifications() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isSignedIn = Boolean(user?.token);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || initializedRef.current) return;
    initializedRef.current = true;

    let unsubscribe;

    (async () => {
      const messaging = await getFcmMessaging();
      if (!messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        console.log('[FCM] foreground message received:', payload);

        const title = payload.notification?.title || payload.data?.title || 'New notification';
        const body = payload.notification?.body || payload.data?.body || payload.data?.message;
        const type = payload.data?.type;
        toast.custom((id) => <FcmToast id={id} title={title} body={body} type={type} />, {
          unstyled: true,
          style: { background: 'transparent', boxShadow: 'none', padding: 0, border: 'none' },
        });
        dispatch(notificationsApi.util.invalidateTags(['notification']));

        if (isBookingNotification(type, payload.data?.objectType)) {
          dispatch(bookingsApi.util.invalidateTags(['bookings']));
        }
      });
    })();

    return () => unsubscribe?.();
  }, [isSignedIn, dispatch]);

  return null;
}
