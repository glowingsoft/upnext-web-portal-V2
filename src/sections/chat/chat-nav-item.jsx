import { useCallback, useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover, usePopover } from 'src/components/custom-popover';
import { Iconify } from 'src/components/iconify';

import { useSelector } from 'react-redux';
import { useResponsive } from 'src/hooks/use-responsive';
import { useTranslate } from 'src/locales/use-locales';
import { useUpdateChatActionMutation, useDeleteChatMutation } from 'src/actions/chat';

import { useNavItem } from './hooks/use-nav-item';

// ----------------------------------------------------------------------

export function ChatNavItem({ selected, collapse, chat, onCloseMobile, onSelect, onBlockSuccess, onChatStateChanged, onDeleteSuccess }) {
  const { t } = useTranslate();
  const { user } = useSelector((state) => state.user);
  const myId = user?.basicInfo?._id || '';

  const mdUp = useResponsive('up', 'md');
  const popover = usePopover();
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [updateChatAction] = useUpdateChatActionMutation();
  const [deleteChat] = useDeleteChatMutation();

  const { displayName, avatarUrl, isOnline, displayText, lastActivity } = useNavItem({ chat, myId });

  const handleClick = useCallback(async () => {
    if (!mdUp) onCloseMobile();
    onSelect({ conversationId: chat.conversationId, objectId: chat.objectId });
  }, [chat.conversationId, chat.objectId, mdUp, onCloseMobile, onSelect]);

  const handleAction = useCallback(
    async (action) => {
      popover.onClose();
      setActionLoading(true);
      try {
        await updateChatAction({ conversationId: chat.conversationId, action }).unwrap();
        onChatStateChanged?.(chat.conversationId, action);
        if (action === 'blocked') onBlockSuccess?.();
      } catch (err) {
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    },
    [chat.conversationId, popover, updateChatAction, onBlockSuccess, onChatStateChanged]
  );

  const handleDeleteChat = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteChat(chat.conversationId).unwrap();
      setDeleteOpen(false);
      onDeleteSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }, [chat.conversationId, deleteChat, onDeleteSuccess]);

  const renderAvatar = (
    <Box sx={{ position: 'relative', flexShrink: 0 }}>
      <Avatar alt={displayName} src={avatarUrl || undefined} sx={{ width: 40, height: 40 }}>
        {String(displayName || '?').trim().charAt(0).toUpperCase()}
      </Avatar>
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
  );

  return (
    <>
      <Box component="li" sx={{ display: 'flex' }}>
        <ListItemButton
          onClick={handleClick}
          sx={{
            py: 1.5,
            px: 2.5,
            gap: 2,
            ...(selected && { bgcolor: 'action.selected' }),
          }}
        >
          <Badge color="error" overlap="circular" badgeContent={collapse ? (chat.unreadCount || 0) : 0}>
            {renderAvatar}
          </Badge>

          {!collapse && (
            <>
              <ListItemText
                primary={displayName}
                primaryTypographyProps={{ noWrap: true, component: 'span', variant: 'subtitle2' }}
                secondary={displayText}
                secondaryTypographyProps={{
                  noWrap: true,
                  component: 'span',
                  variant: 'caption',
                  sx: { fontSize: 13 },
                  color: chat.unreadCount ? 'text.primary' : 'text.secondary',
                }}
              />

              <Stack alignItems="flex-end" sx={{ alignSelf: 'stretch' }}>
                <Typography noWrap variant="body2" component="span" sx={{ mb: 0.5, fontSize: 12, color: 'text.disabled' }}>
                  {lastActivity || ''}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {!!chat.unreadCount && (
                    <Box
                      sx={{
                        minWidth: 18,
                        height: 18,
                        px: 0.5,
                        borderRadius: 999,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        fontSize: 11,
                        lineHeight: '18px',
                        fontWeight: 700,
                        textAlign: 'center',
                      }}
                    >
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </Box>
                  )}

                  <IconButton
                    size="small"
                    disabled={actionLoading}
                    onClick={(e) => { e.stopPropagation(); popover.onOpen(e); }}
                    sx={{ p: 0.25 }}
                  >
                    {actionLoading
                      ? <CircularProgress size={14} color="inherit" />
                      : <Iconify icon="eva:more-vertical-fill" width={16} />
                    }
                  </IconButton>
                </Stack>
              </Stack>
            </>
          )}
        </ListItemButton>
      </Box>

      <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
        <MenuList>
          {chat.chatState === 'favorite' ? (
            <MenuItem onClick={() => handleAction('default')}>
              <Iconify icon="ant-design:heart-filled" width={18} sx={{ color: 'text.disabled' }} />
              {t('removeFavourite')}
            </MenuItem>
          ) : (
            <MenuItem onClick={() => handleAction('favorite')}>
              <Iconify icon="ant-design:heart-filled" width={18} />
              {t('favourite')}
            </MenuItem>
          )}

          {chat.chatState === 'archived' ? (
            <MenuItem onClick={() => handleAction('default')} sx={{ color: 'success.main' }}>
              <Iconify icon="solar:archive-bold" width={18} />
              {t('unarchive')}
            </MenuItem>
          ) : (
            <MenuItem onClick={() => handleAction('archived')}>
              <Iconify icon="solar:archive-bold" width={18} />
              {t('archive')}
            </MenuItem>
          )}

          <Divider sx={{ borderStyle: 'dashed' }} />

          {chat.chatState === 'blocked' ? (
            <MenuItem onClick={() => handleAction('default')} sx={{ color: 'success.main' }}>
              <Iconify icon="solar:check-circle-bold" width={18} />
              {t('unblock')}
            </MenuItem>
          ) : (
            <MenuItem onClick={() => handleAction('blocked')} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:forbidden-circle-bold" width={18} />
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
            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
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
