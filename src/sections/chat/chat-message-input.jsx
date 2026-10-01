import { useRef, useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';

import { useSendMessageMutation } from 'src/actions/chat';

// ----------------------------------------------------------------------

export function ChatMessageInput({
  disabled,
  conversationId,
  objectId,
  bookingId,
  myId,
  onConversationCreated,
  onMessageSent,
  onMessageSettled,
  onMessageFailed,
}) {
  const { t } = useTranslate();
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const [sendMessage] = useSendMessageMutation();

  const handleChangeMessage = useCallback((event) => {
    setMessage(event.target.value);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const payload = {
      _meta: { myId },
      messageType: 'text',
      messageContent: trimmed,
      conversationType: 'direct',
    };

    if (conversationId) {
      payload.conversationId = conversationId;
    } else if (objectId) {
      payload.participantId = objectId;
      // bookingId only ever applies to the message that creates the conversation —
      // once conversationId exists the link is already made server-side.
      if (bookingId) payload.bookingId = bookingId;
    }

    // Optimistically add the sent message to the UI immediately — the input stays
    // enabled the whole time so the user can keep typing/sending; delivery status
    // (pending/failed) is shown on the message bubble itself instead of blocking here.
    const optimisticId = `local_${Date.now()}`;
    const optimisticMessage = {
      _id: optimisticId,
      senderId: myId,
      messageType: 'text',
      messageContent: trimmed,
      createdAt: new Date().toISOString(),
      _sendState: 'pending',
      _retryPayload: payload,
    };
    onMessageSent?.(optimisticMessage);
    setMessage('');
    inputRef.current?.focus();

    try {
      const res = await sendMessage(payload).unwrap();
      onMessageSettled?.(optimisticId, res?.data?._id ? res.data : null);

      if (!conversationId && res?.data?.conversationId) {
        onConversationCreated?.({
          conversationId: res.data.conversationId,
          objectId,
        });
      }
    } catch (err) {
      console.error('Send message failed:', err);
      onMessageFailed?.(optimisticId);
    }
  }, [message, conversationId, objectId, bookingId, myId, sendMessage, onConversationCreated, onMessageSent, onMessageSettled, onMessageFailed]);

  const handleKeyUp = useCallback(
    (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        px: 2,
        py: 1.5,
        flexShrink: 0,
        borderTop: (theme) => `solid 1px ${theme.vars.palette.divider}`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        flexGrow={1}
        sx={{
          pl: 2,
          pr: 0.5,
          borderRadius: 999,
          bgcolor: (theme) => theme.vars.palette.background.neutral,
        }}
      >
        <InputBase
          inputRef={inputRef}
          name="chat-message"
          id="chat-message-input"
          value={message}
          onKeyUp={handleKeyUp}
          onChange={handleChangeMessage}
          placeholder={t('typeMessagePlaceholder')}
          disabled={disabled}
          fullWidth
          sx={{ height: 40 }}
        />
      </Stack>

      <IconButton
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        sx={{
          flexShrink: 0,
          width: 40,
          height: 40,
          color: 'common.white',
          bgcolor: 'primary.main',
          '&:hover': { bgcolor: 'primary.dark' },
          '&.Mui-disabled': {
            color: (theme) => theme.vars.palette.action.disabled,
            bgcolor: (theme) => theme.vars.palette.action.disabledBackground,
          },
        }}
      >
        <Iconify icon="solar:plain-bold" width={20} />
      </IconButton>
    </Stack>
  );
}
