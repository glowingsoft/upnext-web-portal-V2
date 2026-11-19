import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { fTime, fToNow } from 'src/utils/format-time';
import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';

import { useMessage } from './hooks/use-message';

// ----------------------------------------------------------------------

const TICK_ICON = {
  sent: { icon: 'eva:checkmark-outline', color: 'text.disabled' },
  delivered: { icon: 'solar:check-read-linear', color: 'text.disabled' },
  read: { icon: 'solar:check-read-bold', color: 'primary.main' },
};

function Timestamp({ time, title }) {
  return (
    <Typography
      noWrap
      variant="caption"
      title={title}
      sx={{
        fontSize: 11,
        color: 'text.disabled',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {time}
    </Typography>
  );
}


function ReadStatusIcon({ isPending, isFailed, tick, tickLabel, sendingLabel, failedLabel, onRetry }) {
  if (!isPending && !isFailed && !tick) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {isPending && (
        <Tooltip title={sendingLabel}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={11} thickness={6} sx={{ color: 'text.disabled' }} />
          </Box>
        </Tooltip>
      )}

      {isFailed && (
        <Tooltip title={failedLabel}>
          <Box
            role="button"
            tabIndex={0}
            onClick={onRetry}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRetry?.();
              }
            }}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'error.main' }}
          >
            <Iconify icon="solar:danger-triangle-bold" width={13} />
          </Box>
        </Tooltip>
      )}

      {tick && (
        <Tooltip title={tickLabel}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon={tick.icon} width={12} sx={{ color: tick.color }} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}


function MessageBubble({ me, isDeleted, hasImage, content, mediaUrl, onOpenLightbox, deletedLabel, children }) {
  if (isDeleted) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
          p: 1.5,
          minWidth: 48,
          maxWidth: 320,
          borderRadius: 1,
          typography: 'body2',
          fontStyle: 'italic',
          color: 'text.disabled',
          bgcolor: (theme) => theme.palette.action.hover,
        }}
      >
        <Iconify icon="solar:forbidden-circle-line-duotone" width={15} />
        {deletedLabel}
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        p: 1.5,
        pr: hasImage ? 1.5 : 4.5,
        minWidth: 48,
        maxWidth: 320,
        borderRadius: 1,
        typography: 'body2',
        bgcolor: 'background.neutral',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        whiteSpace: 'pre-wrap',
        ...(me && { color: 'grey.800', bgcolor: 'primary.lighter' }),
        ...(hasImage && { p: 0, bgcolor: 'transparent' }),
      }}
    >
      {hasImage ? (
        <Box
          component="img"
          alt="attachment"
          src={mediaUrl || content}
          onClick={onOpenLightbox}
          sx={{
            width: 400,
            height: 'auto',
            borderRadius: 1.5,
            cursor: 'pointer',
            objectFit: 'cover',
            aspectRatio: '16/11',
            '&:hover': { opacity: 0.9 },
          }}
        />
      ) : (
        content
      )}

      <Box sx={{ position: 'absolute', right: 8, bottom: 5 }}>{children}</Box>
    </Box>
  );
}

// Flex row shared by both incoming and outgoing messages — only flexDirection changes
// (row vs row-reverse), never the underlying structure or component logic.
function MessageRow({ me, children }) {
  return (
    <Stack direction={me ? 'row-reverse' : 'row'} alignItems="center" spacing={1}>
      {children}
    </Stack>
  );
}

export function ChatMessageItem({ message, myId, otherUser, isFirstOfGroup = true, isLastOfGroup = true, onOpenLightbox, onDelete, onRetry }) {
  const { t } = useTranslate();
  const { me, hasImage } = useMessage({ message, myId });
  const [deleting, setDeleting] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Text content: real API uses messageContent, fallback to body for compat
  const content = message.messageContent || message.body || '';
  const canDelete = me && !message.isDeleted && !message._sendState && onDelete;
  const isPending = me && message._sendState === 'pending';
  const isFailed = me && message._sendState === 'failed';
  const tick = me && !isPending && !isFailed && TICK_ICON[message.status];

  const TICK_LABEL = { sent: t('messageSent'), delivered: t('messageDelivered'), read: t('messageRead') };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await onDelete?.(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box
      sx={{ mb: isLastOfGroup ? 1.5 : 0.5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <MessageRow me={me}>
        {!me && (
          <Box sx={{ width: 32, flexShrink: 0 }}>
            {isFirstOfGroup && <Avatar alt={otherUser?.name} src={otherUser?.avatarUrl || undefined} sx={{ width: 32, height: 32, fontSize: 14 }}>{String(otherUser?.name || '?').trim().charAt(0).toUpperCase()}</Avatar>}
          </Box>
        )}

        <Stack alignItems={me ? 'flex-end' : 'flex-start'} spacing={0.5}>
          {isFirstOfGroup && !me && (
            <Typography noWrap variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {otherUser?.name || t('defaultUserName')}
            </Typography>
          )}

          <Stack direction={me ? 'row-reverse' : 'row'} alignItems="center" spacing={1}>
            <MessageBubble
              me={me}
              isDeleted={message.isDeleted}
              hasImage={hasImage}
              content={content}
              mediaUrl={message.mediaUrl}
              onOpenLightbox={() => onOpenLightbox(message.mediaUrl || content)}
              deletedLabel={t('messageDeletedText')}
            >
              {!message.isDeleted && (
                <ReadStatusIcon
                  isPending={isPending}
                  isFailed={isFailed}
                  tick={tick}
                  tickLabel={tick ? TICK_LABEL[message.status] : undefined}
                  sendingLabel={t('sendingMessageStatus')}
                  failedLabel={t('failedToSendTapToRetry')}
                  onRetry={() => onRetry?.(message)}
                />
              )}
            </MessageBubble>

            <Timestamp time={fTime(message.createdAt, 'h:mm a')} title={fToNow(message.createdAt)} />
          </Stack>
        </Stack>

        {canDelete && (
          <IconButton
            size="small"
            onClick={handleDelete}
            disabled={deleting}
            sx={{
              width: 22,
              height: 22,
              flexShrink: 0,
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease',
              color: 'text.disabled',
              '&:hover': {
                color: 'error.main',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            {deleting ? <CircularProgress size={12} color="inherit" /> : <Iconify icon="solar:trash-bin-trash-bold" width={13} />}
          </IconButton>
        )}
      </MessageRow>
    </Box>
  );
}
