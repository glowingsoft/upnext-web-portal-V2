import { useCallback, useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { useUpdateChatActionMutation, useDeleteChatMutation } from 'src/actions/chat';

import { ChatHeaderSkeleton } from './chat-skeleton';

// ----------------------------------------------------------------------

export function ChatHeaderDetail({
  collapseNav,
  otherUser,
  conversationId,
  loading,
  isAdmin,
  isBlocked,
  isFavourite,
  isArchived,
  onBlockSuccess,
  onChatStateChanged,
  onDeleteSuccess,
  onStartCall,
}) {
  const { t } = useTranslate();
  const popover = usePopover();
  const router = useRouter();
  const lgUp = useResponsive('up', 'lg');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [updateChatAction] = useUpdateChatActionMutation();
  const [deleteChat] = useDeleteChatMutation();

  const { collapseDesktop, onCollapseDesktop, onOpenMobile } = collapseNav;

  const handleToggleNav = useCallback(() => {
    if (lgUp) onCollapseDesktop();
    else onOpenMobile();
  }, [lgUp, onCollapseDesktop, onOpenMobile]);

  const handleAction = useCallback(
    async (action) => {
      popover.onClose();
      if (!conversationId) return;
      setActionLoading(true);
      try {
        await updateChatAction({ conversationId, action }).unwrap();
        onChatStateChanged?.(conversationId, action);
        if (action === 'blocked') onBlockSuccess?.();
      } catch (err) {
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    },
    [conversationId, popover, updateChatAction, onBlockSuccess, onChatStateChanged]
  );

  const handleDeleteChat = useCallback(async () => {
    if (!conversationId) return;
    setDeleting(true);
    try {
      await deleteChat(conversationId).unwrap();
      setDeleteOpen(false);
      onDeleteSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }, [conversationId, deleteChat, onDeleteSuccess]);

  const handleNavigateToProfile = useCallback(() => {
    if (!otherUser?._id) return;
    const basePath = isAdmin
      ? paths.adminDashboard.clientsDetails(otherUser._id)
      : paths.dashboard.clientsDetails(otherUser._id);
    router.push(basePath);
  }, [otherUser, isAdmin, router]);

  if (loading) return <ChatHeaderSkeleton />;

  const isOnline = !!otherUser?.isOnline;

  const renderSingle = (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
    // onClick={handleNavigateToProfile}
    // sx={{ cursor: 'pointer', ':hover': { textDecoration: 'underline', textUnderlineOffset: '3px' } }}
    >
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Avatar src={otherUser?.avatarUrl} alt={otherUser?.name} />
        <Box
          sx={{
            position: 'absolute',
            right: -1,
            bottom: -1,
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: isOnline ? 'success.main' : 'text.disabled',
            border: (t) => `solid 2px ${t.palette.background.paper}`,
          }}
        />
      </Box>

      <ListItemText
        primary={otherUser?.name || t('unknownUser')}
        secondary={otherUser?.isOnline ? t('online') : null}
        primaryTypographyProps={{ noWrap: true, component: 'span', variant: 'subtitle2' }}
        secondaryTypographyProps={{ noWrap: true, component: 'span', variant: 'caption', color: 'success.main' }}
      />
    </Stack>
  );

  return (
    <>
      {renderSingle}

      <Stack direction="row" flexGrow={1} justifyContent="flex-end">
        {/* <Tooltip title="Start audio call" arrow placement="top">
          <IconButton onClick={() => onStartCall?.('audio')}>
            <Iconify icon="solar:phone-bold" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Start video call" arrow placement="top">
          <IconButton onClick={() => onStartCall?.('video')}>
            <Iconify icon="solar:videocamera-record-bold" />
          </IconButton>
        </Tooltip> */}

        <Tooltip title={isFavourite ? t('removeFromFavourites') : t('favourite')} arrow placement="top">
          <IconButton onClick={() => handleAction(isFavourite ? 'default' : 'favorite')}>
            <Iconify icon="ant-design:heart-filled" sx={{ color: isFavourite ? 'error.main' : 'inherit' }} />
          </IconButton>
        </Tooltip>

        <IconButton onClick={handleToggleNav}>
          <Iconify icon={!collapseDesktop ? 'ri:sidebar-unfold-fill' : 'ri:sidebar-fold-fill'} />
        </IconButton>

        <IconButton onClick={popover.onOpen} disabled={actionLoading}>
          {actionLoading
            ? <CircularProgress size={20} color="inherit" />
            : <Iconify icon="eva:more-vertical-fill" />
          }
        </IconButton>
      </Stack>

      <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
        <MenuList>
          {isArchived ? (
            <MenuItem onClick={() => handleAction('default')} sx={{ color: 'success.main' }}>
              <Iconify icon="solar:archive-bold" />
              {t('unarchiveChat')}
            </MenuItem>
          ) : (
            <MenuItem onClick={() => handleAction('archived')}>
              <Iconify icon="solar:archive-bold" />
              {t('archiveChat')}
            </MenuItem>
          )}

          {isBlocked ? (
            <MenuItem onClick={() => handleAction('default')} sx={{ color: 'success.main' }}>
              <Iconify icon="solar:check-circle-bold" />
              {t('unblock')}
            </MenuItem>
          ) : (
            <MenuItem onClick={() => handleAction('blocked')} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:forbidden-circle-bold" />
              {t('block')}
            </MenuItem>
          )}

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem
            onClick={() => {
              popover.onClose();
              setDeleteOpen(true);
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            {t('deleteChat')}
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('deleteChat')}
        content={t('deleteChatConfirmMessage')}
        action={
          <LoadingButton variant="contained" color="error" loading={deleting} onClick={handleDeleteChat}>
            {t('deleteAction')}
          </LoadingButton>
        }
      />
    </>
  );
}
