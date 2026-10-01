import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { connectChatSocket, disconnectChatSocket } from 'src/actions/chat';

const ChatSocketContext = createContext({
  socket: null,
  setActiveObjectId: () => { },
  totalUnreadCount: 0,
  notificationUnreadCount: 0,
  setNotificationUnreadCount: () => { },
});

export function ChatSocketProvider({ children }) {
  const myId = useSelector((state) => state.user?.user?.basicInfo?._id) || '';
  const [socket, setSocket] = useState(null);
  const [activeObjectId, setActiveObjectIdState] = useState(null);
  const hasConnectedOnceRef = useRef(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);

  useEffect(() => {
    if (!myId) return undefined;

    let didConnect = false;
    const delay = hasConnectedOnceRef.current ? 300 : 800;

    const connectTimer = setTimeout(() => {
      hasConnectedOnceRef.current = true;
      didConnect = true;
      const sock = connectChatSocket({ subjectId: myId, objectId: activeObjectId || undefined });
      setSocket(sock || null);
    }, delay);

    return () => {
      clearTimeout(connectTimer);
      if (!didConnect) return;
      disconnectChatSocket();
      setSocket(null);
    };
  }, [myId, activeObjectId]);

  const setActiveObjectId = useCallback((objectId) => {
    setActiveObjectIdState(objectId || null);
  }, []);

  // Kept independent of chat-view.jsx's own listeners (which get torn down the
  // moment the chat page unmounts) so the sidebar badge keeps updating no
  // matter which page is currently open.
  useEffect(() => {
    if (!socket) return undefined;

    const handleUnreadCounts = (payload) => {
      if (payload?.total != null) setTotalUnreadCount(payload.total);
    };

    const handleChatUpdated = (payload) => {
      if (payload?.totalUnreadCount != null) setTotalUnreadCount(payload.totalUnreadCount);
    };

    const handleNotificationReceived = (payload) => {
      // eslint-disable-next-line no-console
      console.log('notificationReceived payload:', payload);
      const count = payload?.unreadCount ?? payload?.count ?? payload?.total;
      setNotificationUnreadCount((prev) => (count != null ? count : prev + 1));
    };

    socket.on('unreadCounts', handleUnreadCounts);
    socket.on('chatUpdated', handleChatUpdated);
    socket.on('notificationReceived', handleNotificationReceived);

    return () => {
      socket.off('unreadCounts', handleUnreadCounts);
      socket.off('chatUpdated', handleChatUpdated);
      socket.off('notificationReceived', handleNotificationReceived);
    };
  }, [socket]);

  return (
    <ChatSocketContext.Provider
      value={{ socket, setActiveObjectId, totalUnreadCount, notificationUnreadCount, setNotificationUnreadCount }}
    >
      {children}
    </ChatSocketContext.Provider>
  );
}

export function useChatSocketContext() {
  return useContext(ChatSocketContext);
}
