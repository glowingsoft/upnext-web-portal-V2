import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { m } from 'framer-motion';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales/use-locales';
import { useChatSocketContext } from 'src/sections/chat/chat-socket-provider';
import { useLazyGetNotificationsQuery, useMarkNotificationsReadMutation } from 'src/store/Reducer/notifications-api';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';
import { getNotificationTypeMeta } from 'src/utils/notification-type';
import { fToNow } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const LIMIT = 10;

// Backend notification types (see notificationsRoutes.js):
//   newMessage, system, reminder, newBooking, BookingRequest, bookingApproved, bookingRejected,
//   bookingPicked, bookingCompleted, bookingCanceled, certificationApproved, certificationRejected
// `objectType` ("booking" | "user") is the reliable signal for where a notification points —
// `type` is just the specific event name and can't be substring-matched safely on its own
// (e.g. "reminder" and "system" carry no "booking" substring despite pointing at a booking).
function getNotificationTarget(notification) {
  const objectType = (notification.objectType || '').toLowerCase();
  const type = (notification.type || '').toLowerCase();
  const isCertification = type.includes('certification');
  const isBooking = objectType === 'booking' || type.includes('booking');
  const isMessage = objectType === 'user' || type.includes('message');

  if (isCertification) {
    return { pathname: paths.dashboard.businessProfile };
  }

  if (isBooking && notification.objectId) {
    return { pathname: paths.dashboard.bookingDetails(notification.objectId) };
  }

  if (isMessage && notification.subject?._id) {
    return {
      pathname: paths.dashboard.chat,
      state: {
        userId: notification.subject._id,
        name: notification.subject.name || '',
        profileIcon: normalizeImageUrl(notification.subject.profileIcon) || '',
      },
    };
  }

  return null;
}

const isNotificationRead = (item) => Boolean(item?.isRead ?? item?.read ?? false);

function NotificationCardSkeleton() {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ p: 2, mb: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
    >
      <Skeleton variant="circular" width={44} height={44} sx={{ flexShrink: 0 }} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="45%" height={20} />
        <Skeleton variant="text" width="85%" height={16} />
      </Box>
    </Stack>
  );
}

export function NotificationsDrawer({ sx, ...other }) {
  const { t } = useTranslate();
  const router = useRouter();
  const drawer = useBoolean();
  const [scrollEl, setScrollEl] = useState(null);
  const [locallyReadIds, setLocallyReadIds] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState([]);

  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.permission === 1;

  const { notificationUnreadCount, setNotificationUnreadCount } = useChatSocketContext();
  const [fetchNotifications, { data, isFetching, isLoading }] = useLazyGetNotificationsQuery();
  const [markNotificationsRead] = useMarkNotificationsReadMutation();

  useEffect(() => {
    const raw = data?.data;
    const list = raw?.docs || raw?.data || (Array.isArray(raw) ? raw : []);

    setAccumulated((prev) => {
      if (page === 1) return list;
      const seen = new Set(prev.map((item) => item._id || item.id));
      const fresh = list.filter((item) => !seen.has(item._id || item.id));
      return [...prev, ...fresh];
    });
  }, [data, page]);

  const totalPages = data?.meta?.totalPages ?? 1;
  const hasMore = page < totalPages;

  const notifications = useMemo(
    () =>
      accumulated.map((item) => {
        const id = item._id || item.id;
        return { ...item, id, isUnRead: !(isNotificationRead(item) || locallyReadIds.has(id)) };
      }),
    [accumulated, locallyReadIds]
  );

  const totalUnRead = notificationUnreadCount || data?.meta?.unreadCount || notifications.filter((item) => item.isUnRead).length;
  const showInitialSkeleton = notifications.length === 0 && (isLoading || (page === 1 && isFetching));

  const handleBellClick = () => {
    if (!isAdmin) {
      setPage(1);
      fetchNotifications({ page: 1, limit: LIMIT });
    }
    drawer.onTrue();
  };

  const handleReadAll = () => {
    setLocallyReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((item) => next.add(item.id));
      return next;
    });
    setNotificationUnreadCount(0);

    markNotificationsRead().unwrap().catch(() => {
      toast.error(t('somethingWentWrongTryAgain'));
    });
  };

  const handleReadOne = (id) => {
    setLocallyReadIds((prev) => new Set(prev).add(id));
    setNotificationUnreadCount((prev) => Math.max(0, prev - 1));

    markNotificationsRead([id]).unwrap().catch(() => {
      toast.error(t('somethingWentWrongTryAgain'));
    });
  };

  const handleNotificationClick = (notification) => {
    if (notification.isUnRead) handleReadOne(notification.id);

    const target = getNotificationTarget(notification);
    if (!target) return;

    router.push(target.pathname, target.state ? { state: target.state } : undefined);
    drawer.onFalse();
  };

  const handleScroll = useCallback(() => {
    if (!scrollEl || !hasMore || isFetching) return;

    if (scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 120) {
      setPage((prev) => prev + 1);
    }
  }, [scrollEl, hasMore, isFetching]);

  useEffect(() => {
    if (page > 1) fetchNotifications({ page, limit: LIMIT });
  }, [page, fetchNotifications]);

  useEffect(() => {
    if (!scrollEl) return undefined;
    scrollEl.addEventListener('scroll', handleScroll);
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, [scrollEl, handleScroll]);

  // Notification Card UI
  const renderNotificationCard = (notification) => {
    const typeMeta = getNotificationTypeMeta(notification.type);
    const avatarUrl = normalizeImageUrl(notification.subject?.profileIcon);
    const timeLabel = notification.timeSince || (notification.createdAt ? fToNow(notification.createdAt) : '');
    const clickable = notification.isUnRead || Boolean(getNotificationTarget(notification));

    return (
      <Box
        key={notification.id}
        onClick={() => handleNotificationClick(notification)}
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          bgcolor: notification.isUnRead ? (theme) => alpha(theme.palette.primary.main, 0.04) : 'background.paper',
          borderRadius: 2,
          p: 2,
          mb: 1.5,
          border: '1px solid',
          borderColor: notification.isUnRead ? (theme) => alpha(theme.palette.primary.main, 0.24) : 'divider',
          cursor: clickable ? 'pointer' : 'default',
          transition: 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
          '&:hover': clickable ? { boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[2] } : {},
        }}
      >
        {avatarUrl ? (
          <Avatar
            src={avatarUrl}
            alt={notification.subject?.name}
            sx={{ width: 44, height: 44, flexShrink: 0, bgcolor: 'primary.lighter', color: 'primary.dark' }}
          >
            {notification.subject?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
        ) : (
          <Box
            sx={{
              width: 44,
              height: 44,
              bgcolor: (theme) => alpha(theme.palette[typeMeta.color]?.main || theme.palette.grey[500], 0.12),
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon={typeMeta.icon} width={22} sx={{ color: `${typeMeta.color}.main` }} />
          </Box>
        )}

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {notification.title || notification.message || t('notificationCardTitle')}
            </Typography>
            {timeLabel && (
              <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                {timeLabel}
              </Typography>
            )}
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {notification.description || notification.body || t('notificationCardDescription')}
          </Typography>
        </Box>

        {notification.isUnRead && (
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0, mt: 0.75 }} />
        )}
      </Box>
    );
  };

  if (isAdmin) {
    return null;
  }

  return (
    <>
      <IconButton component={m.button} whileTap="tap" whileHover="hover" onClick={handleBellClick} sx={sx} {...other}>
        <Badge badgeContent={totalUnRead} color="error">
          <SvgIcon>
            <path
              fill="currentColor"
              d="M18.75 9v.704c0 .845.24 1.671.692 2.374l1.108 1.723c1.011 1.574.239 3.713-1.52 4.21a25.794 25.794 0 0 1-14.06 0c-1.759-.497-2.531-2.636-1.52-4.21l1.108-1.723a4.393 4.393 0 0 0 .693-2.374V9c0-3.866 3.022-7 6.749-7s6.75 3.134 6.75 7"
              opacity="0.5"
            />
            <path fill="currentColor" d="M12.75 6a.75.75 0 0 0-1.5 0v4a.75.75 0 0 0 1.5 0zM7.243 18.545a5.002 5.002 0 0 0 9.513 0c-3.145.59-6.367.59-9.513 0" />
          </SvgIcon>
        </Badge>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 1, maxWidth: 420, p: 0, bgcolor: 'grey.50', display: 'flex', flexDirection: 'column' } }}
      >
        <Box sx={{ px: 2, pt: 3, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, bgcolor: 'grey.50' }}>
          {totalUnRead > 0 ? (
            <Tooltip title={t('markAllAsRead')}>
              <IconButton
                aria-label={t('markAllAsRead')}
                size="small"
                onClick={handleReadAll}
                sx={{
                  color: 'primary.main',
                  width: 40,
                  height: 40,
                }}
              >
                <Iconify icon="solar:check-read-linear" width={22} />
              </IconButton>
            </Tooltip>
          ) : (
            <Box sx={{ width: 40, height: 40, flexShrink: 0 }} aria-hidden />
          )}

          <Typography variant="h6" align="center" fontWeight={700} sx={{ flexGrow: 1 }}>
            {t('notifications')}
          </Typography>

          <IconButton aria-label={t('closeNotifications')} size="small" onClick={drawer.onFalse} sx={{ width: 40, height: 40, color: 'text.secondary' }}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>

        <Scrollbar ref={setScrollEl} sx={{ px: 2, pb: 2, flex: '1 1 auto' }}>
          {showInitialSkeleton ? (
            Array.from({ length: 5 }).map((_, index) => <NotificationCardSkeleton key={index} />)
          ) : notifications.length === 0 ? (
            <Stack spacing={1} alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <Iconify icon="solar:bell-off-bold" width={40} sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary" align="center">
                {t('noNotifications')}
              </Typography>
            </Stack>
          ) : (
            <>
              {notifications.map(renderNotificationCard)}
              {isFetching && page > 1 && (
                <Stack alignItems="center" sx={{ py: 2 }}>
                  <CircularProgress size={22} />
                </Stack>
              )}
            </>
          )}
        </Scrollbar>
      </Drawer>
    </>
  );
}
