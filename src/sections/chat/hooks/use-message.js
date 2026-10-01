// ----------------------------------------------------------------------
// Determines if a message was sent by the current user.
//
// Real message shape from GET /app/conversations/messages:
// { _id, senderId, messageType, messageContent, mediaUrl, createdAt, timesince }
// ----------------------------------------------------------------------

export function useMessage({ message, myId }) {
  const me = message.senderId === myId;

  const hasImage = message.messageType === 'image';

  return { me, hasImage };
}
