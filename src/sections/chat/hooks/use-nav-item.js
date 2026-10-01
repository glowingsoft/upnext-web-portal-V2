// ----------------------------------------------------------------------
// Adapts a real chat list item to what ChatNavItem needs for display.
//
// Real shape from GET /app/conversations:
// { conversationId, objectId, chatName, chatIcon, isOnline, canMessage,
//   unreadCount, lastMessage: { messageContent, messageType, timesince, senderId, senderName } }
// ----------------------------------------------------------------------

import { useTranslate } from 'src/locales/use-locales';

import { normalizeImageUrl } from 'src/utils/normalize-image-url';

export function useNavItem({ chat, myId }) {
  const { t } = useTranslate();
  const lastMsg = chat?.lastMessage || {};

  let displayText = t('noMessagesYet');
  if (lastMsg.messageContent) {
    const isMine = lastMsg.senderId === myId;
    const prefix = isMine ? `${t('you')}: ` : '';
    const body = lastMsg.messageType === 'image' ? t('sentAPhoto') : lastMsg.messageContent;
    displayText = `${prefix}${body}`;
  }

  return {
    displayName: chat?.chatName || t('unknownUser'),
    avatarUrl: normalizeImageUrl(chat?.chatIcon),
    isOnline: !!chat?.isOnline,
    displayText,
    lastActivity: lastMsg.timesince || null,
  };
}
