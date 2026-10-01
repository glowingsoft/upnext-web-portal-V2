import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { useLocation, useNavigationType } from 'react-router-dom';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useDispatch, useSelector } from 'react-redux';

import { CONFIG } from 'src/config-global';
import { useDebouncedInput } from 'src/hooks/use-debounced-input';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { normalizeImageUrl } from 'src/utils/normalize-image-url';
import { decodeHtmlEntities } from 'src/utils/decode-html-entities';

import { chatApi, useGetChatsQuery, useGetMessagesQuery, useUpdateChatActionMutation, useDeleteMessageMutation, useSendMessageMutation } from 'src/actions/chat';

const TAB_TO_CHAT_STATE = {
  inbox: 'default',
  favourites: 'favorite',
  archived: 'archived',
  blocked: 'blocked',
};

// Shared between the local (own-side) delete and the incoming messageDeleted
// socket broadcast so both mark a message the same way.
function markMessageDeleted(list, messageId) {
  return list.map((m) => (m._id === messageId ? { ...m, isDeleted: true } : m));
}

import { ChatHeaderDetail } from '../chat-header-detail';
import { ChatCallScreen } from '../chat-call-screen';
import { ChatMessageInput } from '../chat-message-input';
import { ChatMessageList } from '../chat-message-list';
import { ChatNav } from '../chat-nav';
import { ChatRoom } from '../chat-room';
import { useChatSocketContext } from '../chat-socket-provider';
import { useCallSignaling } from '../hooks/use-call-signaling';
import { useCollapseNav } from '../hooks/use-collapse-nav';
import { Layout } from '../layout';

// ----------------------------------------------------------------------

export function ChatView() {
  const { t } = useTranslate();
  const router = useRouter();
  const location = useLocation();

  // Real user from Redux — user.basicInfo._id is the MongoDB ObjectId
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const myId = user?.basicInfo?._id || '';
  const isAdmin = user?.accountState?.userType === 'admin';

  // Navigation state (kept out of the URL so the address bar always just reads
  // /chat, regardless of which conversation is open):
  //   { conversationId, objectId }                          → from sidebar click
  //   { userId, name, profileIcon, bookingId }               → from client/leads profile navigation
  const navState = location.state || {};
  const conversationIdParam = navState.conversationId || '';
  const objectIdParam = navState.objectId || navState.userId || '';
  const nameParam = navState.name || '';
  const profileIconParam = navState.profileIcon || '';

  const bookingIdParam = navState.bookingId || '';

  const navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType === 'POP') {
      const navType = performance.getEntriesByType?.('navigation')?.[0]?.type;
      if (navType === 'reload') {
        const hasConvParams = !!(navState.conversationId || navState.objectId || navState.userId);
        if (hasConvParams) {
          router.replace(isAdmin ? paths.adminDashboard.chat : paths.dashboard.chat);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chat list filters — lifted here so they drive the API call
  const [currentTab, setCurrentTab] = useState('inbox');
  const { displayValue: searchDisplayValue, debouncedValue: debouncedKeyword, handleChange: handleSearchChange } = useDebouncedInput('', undefined, 500);

  const handleTabChange = useCallback((_, newTab) => {
    setCurrentTab(newTab);
  }, []);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [accumulatedMsgs, setAccumulatedMsgs] = useState([]);

  // Socket-received live messages for the active conversation
  const [liveMessages, setLiveMessages] = useState([]);

  // Live online/offline status per userId (objectId), keyed off userStatusChanged socket
  // events — the REST chat list only reflects isOnline as of whenever it was last fetched.
  const [onlineStatusMap, setOnlineStatusMap] = useState({});

  // Live unread counts per conversationId, keyed off chatUpdated socket events — lets
  // the sidebar badge update instantly instead of waiting for the chats refetch.
  const [unreadOverrides, setUnreadOverrides] = useState({});

  // Live last-message preview per conversationId, keyed off chatUpdated socket
  // events (both new-message and delete variants) — refreshed on every relevant
  // event so it never goes stale, same reasoning as unreadOverrides above.
  const [lastMessageOverrides, setLastMessageOverrides] = useState({});

  // conversationIds removed via a real-time conversationDeleted event — filtered
  // out of the sidebar immediately instead of waiting for the next REST fetch.
  const [removedConversationIds, setRemovedConversationIds] = useState({});

  // conversationIds that received a new message, most-recent-first — used to
  // bump a conversation to the top of the sidebar the way a REST refetch's
  // server-side sort used to, now that we no longer refetch on every event.
  const [recentOrder, setRecentOrder] = useState([]);

  // Refs used inside the socket listener so it always has the latest values
  // without needing to reconnect the socket on every render.
  const activeConversationIdRef = useRef(null);
  const activeObjectIdRef = useRef(null);
  const dispatchRef = useRef(dispatch);

  // ── Chat list (sidebar) ───────────────────────────────────────────────
  const {
    data: chatsData,
    isLoading: chatsLoading,
    isFetching: chatsFetching,
    refetch: refetchChats,
  } = useGetChatsQuery(
    {
      chatState: TAB_TO_CHAT_STATE[currentTab] || '',
      keyword: debouncedKeyword,
    },
    { refetchOnMountOrArgChange: true }
  );

  const chats = useMemo(() => {
    const raw = (chatsData?.data || []).filter((chat) => !removedConversationIds[chat.conversationId]);
    const patched = raw.map((chat) => {
      let next = chat;
      if (Object.prototype.hasOwnProperty.call(onlineStatusMap, chat.objectId)) {
        next = { ...next, isOnline: onlineStatusMap[chat.objectId] };
      }
      if (Object.prototype.hasOwnProperty.call(unreadOverrides, chat.conversationId)) {
        next = { ...next, unreadCount: unreadOverrides[chat.conversationId] };
      }
      if (Object.prototype.hasOwnProperty.call(lastMessageOverrides, chat.conversationId)) {
        next = { ...next, lastMessage: lastMessageOverrides[chat.conversationId] };
      }
      return next;
    });

    if (!recentOrder.length) return patched;

    const byId = new Map(patched.map((chat) => [chat.conversationId, chat]));
    const boosted = recentOrder.map((id) => byId.get(id)).filter(Boolean);
    const boostedIds = new Set(boosted.map((chat) => chat.conversationId));
    const rest = patched.filter((chat) => !boostedIds.has(chat.conversationId));
    return [...boosted, ...rest];
  }, [chatsData, onlineStatusMap, unreadOverrides, lastMessageOverrides, removedConversationIds, recentOrder]);

  // Find the active chat item from sidebar list (gives us chatName, chatIcon etc.)
  const activeChat = useMemo(() => {
    if (!chats.length) return null;
    if (conversationIdParam) return chats.find((c) => c.conversationId === conversationIdParam) || null;
    if (objectIdParam) return chats.find((c) => c.objectId === objectIdParam) || null;
    return null;
  }, [chats, conversationIdParam, objectIdParam]);

  // ── Messages ─────────────────────────────────────────────────────────
  const isConversationSelected = !!(conversationIdParam || objectIdParam);

  const messagesQueryArg = useMemo(() => {
    if (!isConversationSelected) return null;
    const base = conversationIdParam ? { conversationId: conversationIdParam } : { objectId: objectIdParam };
    return { ...base, page };
  }, [conversationIdParam, objectIdParam, isConversationSelected, page]);

  const {
    data: messagesData,
    isLoading: messagesLoading,
    isFetching: messagesFetching,
  } = useGetMessagesQuery(messagesQueryArg, { skip: !messagesQueryArg, refetchOnMountOrArgChange: true });

  // Derive conversationId from first loaded message if we only have objectId
  const derivedConversationId = useMemo(() => {
    if (conversationIdParam) return conversationIdParam;
    if (messagesData?.data?.length) return messagesData.data[0]?.conversationId || null;
    return null;
  }, [conversationIdParam, messagesData]);

  // Keep socket-filter refs in sync with the latest values.
  useEffect(() => {
    activeConversationIdRef.current = derivedConversationId;
  }, [derivedConversationId]);
  useEffect(() => {
    activeObjectIdRef.current = objectIdParam;
  }, [objectIdParam]);
  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  const cachedUrlUserInfoRef = useRef(null);
  useEffect(() => {
    if (objectIdParam && nameParam) {
      cachedUrlUserInfoRef.current = { objectId: objectIdParam, name: decodeHtmlEntities(nameParam), avatarUrl: normalizeImageUrl(profileIconParam) };
    }
  }, [objectIdParam, nameParam, profileIconParam]);

  // Reset ALL state when conversation changes
  useEffect(() => {
    setPage(1);
    setAccumulatedMsgs([]);
    setLiveMessages([]);
    setHasMore(false);
    setLoadingMore(false);

    if (conversationIdParam) {
      // Force to 0 unconditionally — the unread count may be coming straight from
      // the REST list (no override entry yet), so checking for an existing
      // override first would silently no-op and leave the stale badge showing.
      setUnreadOverrides((prev) => ({ ...prev, [conversationIdParam]: 0 }));
    }
  }, [conversationIdParam, objectIdParam]);

  // Accumulate messages across pages (API returns newest-first → reverse to oldest-first)
  useEffect(() => {
    if (!messagesData?.data || messagesFetching) return;

    const incoming = [...messagesData.data].reverse();

    setAccumulatedMsgs((prev) => {
      if (page === 1) return incoming; // first page → replace
      return [...incoming, ...prev]; // older page → prepend
    });

    const totalPages = messagesData.meta?.totalPages || 1;
    setHasMore(page < totalPages);
    setLoadingMore(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesData, messagesFetching]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore || messagesFetching) return;
    setLoadingMore(true);
    setPage((prev) => prev + 1);
  }, [hasMore, loadingMore, messagesFetching]);

  const [deleteMessage] = useDeleteMessageMutation();
  const [retrySendMessage] = useSendMessageMutation();

  // Shared by the normal compose-send flow (chat-message-input) and message-bubble
  // retries below — both patch the same optimistic entry in liveMessages by id.
  const handleMessageSettled = useCallback((optimisticId, realMessage) => {
    setLiveMessages((prev) =>
      prev.map((m) => {
        if (m._id !== optimisticId) return m;
        if (realMessage) return realMessage;
        const { _sendState, ...rest } = m;
        return rest;
      })
    );
  }, []);

  const handleMessageFailed = useCallback((optimisticId) => {
    setLiveMessages((prev) => prev.map((m) => (m._id === optimisticId ? { ...m, _sendState: 'failed' } : m)));
  }, []);

  const handleDeleteMessage = useCallback(
    async (message) => {
      try {
        await deleteMessage({ messageId: message._id, conversationId: message.conversationId || derivedConversationId }).unwrap();
        // Patch both lists directly for instant feedback — same reasoning as the send
        // flow: the mutation's own invalidation triggers a separate, unawaited REST
        // refetch, so waiting for it to "reveal" the tombstone would flicker.
        setAccumulatedMsgs((prev) => markMessageDeleted(prev, message._id));
        setLiveMessages((prev) => markMessageDeleted(prev, message._id));
      } catch (err) {
        console.error('Delete message failed:', err);
      }
    },
    [deleteMessage, derivedConversationId]
  );

  // Combined messages for display
  // Dedupe by _id — a message can legitimately end up in both lists (e.g. the just-sent
  // message gets swapped into liveMessages with its real _id immediately, and later the
  // invalidated REST refetch pulls the same message into accumulatedMsgs too).
  const allMessages = useMemo(() => {
    const seen = new Set();
    const merged = [];
    [...accumulatedMsgs, ...liveMessages].forEach((m) => {
      if (seen.has(m._id)) return;
      seen.add(m._id);
      merged.push(m);
    });
    return merged;
  }, [accumulatedMsgs, liveMessages]);

  // ── Socket ────────────────────────────────────────────────────────────
  // The connection itself is owned by ChatSocketProvider (session-wide, alive
  // regardless of which page is open) — this just subscribes/unsubscribes
  // this view's own listeners on whatever socket instance is currently live.
  const { socket, setActiveObjectId } = useChatSocketContext();

  // Tell the provider which conversation (if any) is currently open, so it can
  // reconnect with objectId scoped to that participant. Resets to null (back to
  // subjectId-only mode) whenever objectIdParam changes and, crucially, on
  // unmount — i.e. when the user navigates away from the Chat page entirely.
  useEffect(() => {
    setActiveObjectId(objectIdParam || null);
    return () => {
      setActiveObjectId(null);
    };
  }, [objectIdParam, setActiveObjectId]);

  // Only needed for the one case a pure socket patch can't handle: a brand-new
  // conversation the recipient has never seen before, which isn't in `chats`
  // yet and so has no local chatName/chatIcon/etc. to patch onto.
  const chatsRef = useRef(chats);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);
  const refetchChatsRef = useRef(refetchChats);
  useEffect(() => {
    refetchChatsRef.current = refetchChats;
  }, [refetchChats]);

  useEffect(() => {
    if (!socket) return undefined;

    // Route each incoming socket message to the right place.
    // Refs give us the latest conversation identity without requiring a reconnect.
    const handleReceiveMessage = (incoming) => {
      const activeConvId = activeConversationIdRef.current;
      const activeObjId = activeObjectIdRef.current;

      const isForActiveConversation = activeConvId ? incoming.conversationId === activeConvId : !!activeObjId && incoming.senderId === activeObjId;

      if (isForActiveConversation) {
        // Message belongs to the open conversation — append to live view immediately.
        setLiveMessages((prev) => [...prev, incoming]);
      } else if (incoming.conversationId) {
        // Message belongs to a different conversation. Invalidate that conversation's
        // Messages cache so the next time the user opens it, RTK Query fetches fresh data
        // instead of returning the stale cached response that's missing this message.
        dispatchRef.current(chatApi.util.invalidateTags([{ type: 'Messages', id: incoming.conversationId }]));
      }
    };

    // Any conversation updated — patch the sidebar preview (and, for new messages,
    // the unread badge + top-of-list ordering) instantly, entirely from the
    // socket payload. `type` disambiguates two payload shapes sharing this event:
    //   'newMessage'      — subjectId/objectId/senderName/unreadCount present
    //   'messageDeleted'  — flatter payload, no unread fields (deletes never
    //                       change who's unread), conversationId top-level
    const handleChatUpdated = (payload) => {
      const isDeleteType = payload?.type === 'messageDeleted';
      const conversationId = isDeleteType
        ? payload?.conversationId
        : payload?.messageContent?.conversationId || payload?.conversationId;

      // Keep the sidebar's last-message preview fresh for both new messages and
      // deletions — updated here on every relevant event so it's never stale.
      if (conversationId && payload?.messageContent && typeof payload.messageContent === 'object') {
        const mc = payload.messageContent;
        setLastMessageOverrides((prev) => ({
          ...prev,
          [conversationId]: {
            _id: mc._id,
            messageContent: mc.messageContent,
            messageType: mc.messageType,
            senderId: mc.senderId,
            senderName: mc.senderName,
            timesince: mc.timesince,
          },
        }));
      }

      if (!isDeleteType) {
        const unreadCount = payload?.unreadCount ?? payload?.totalUnreadCount;
        if (conversationId && unreadCount != null) {
          // If this conversation is the one currently open, the user is already
          // reading it — don't show a stale unread count for it.
          const isActiveConversation = activeConversationIdRef.current === conversationId || activeObjectIdRef.current === payload?.subjectId;
          setUnreadOverrides((prev) => ({ ...prev, [conversationId]: isActiveConversation ? 0 : unreadCount }));
        }

        if (conversationId) {
          // Bump to the top of the sidebar, same as a fresh REST sort would.
          setRecentOrder((prev) => [conversationId, ...prev.filter((id) => id !== conversationId)]);

          // The one case that genuinely needs a REST round-trip: a brand-new
          // conversation we've never loaded (no chatName/chatIcon/etc. to patch
          // onto locally). Existing conversations never hit this branch.
          const isKnownConversation = chatsRef.current.some((c) => c.conversationId === conversationId);
          if (!isKnownConversation) {
            refetchChatsRef.current?.();
          }
        }
      }
    };

    // Real-time delete broadcast to the conversation room — updates the message
    // thread itself for anyone currently viewing this exact conversation.
    const handleMessageDeleted = (payload) => {
      const { messageId, conversationId } = payload || {};
      if (!messageId || !conversationId) return;
      if (activeConversationIdRef.current !== conversationId) return;
      setAccumulatedMsgs((prev) => markMessageDeleted(prev, messageId));
      setLiveMessages((prev) => markMessageDeleted(prev, messageId));
    };

    // The other participant deleted the conversation entirely (not just a
    // message within it) — drop it from our sidebar and, if we're currently
    // looking at it, navigate away since it no longer exists.
    const handleConversationDeleted = (payload) => {
      const { conversationId } = payload || {};
      if (!conversationId) return;
      if (activeConversationIdRef.current === conversationId) {
        router.push(isAdmin ? paths.adminDashboard.chat : paths.dashboard.chat);
      }
      setRemovedConversationIds((prev) => ({ ...prev, [conversationId]: true }));
    };

    // Live presence — updates the nav list dot and the header/room "Online" label
    // without waiting for a REST refetch.
    const handleUserStatusChanged = ({ userId, status }) => {
      if (!userId) return;
      setOnlineStatusMap((prev) => ({ ...prev, [userId]: status === 'online' }));
    };

    const handleUnreadCounts = (payload) => {
      const byConversation = payload?.byConversation || {};
      const next = { ...byConversation };
      chatsRef.current.forEach((chat) => {
        if (!(chat.conversationId in next)) next[chat.conversationId] = 0;
      });
      setUnreadOverrides(next);
    };

    const handleReconnect = () => {
      refetchChatsRef.current?.();
      if (activeConversationIdRef.current) {
        dispatchRef.current(chatApi.util.invalidateTags([{ type: 'Messages', id: activeConversationIdRef.current }]));
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('chatUpdated', handleChatUpdated);
    socket.on('userStatusChanged', handleUserStatusChanged);
    socket.on('unreadCounts', handleUnreadCounts);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('conversationDeleted', handleConversationDeleted);
    socket.io.on('reconnect', handleReconnect);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('chatUpdated', handleChatUpdated);
      socket.off('userStatusChanged', handleUserStatusChanged);
      socket.io.off('reconnect', handleReconnect);
      socket.off('unreadCounts', handleUnreadCounts);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('conversationDeleted', handleConversationDeleted);
    };
  }, [socket]);

  // ── Calling ──────────────────────────────────────────────────────────
  const {
    callState,
    peer: callPeer,
    callMode,
    remoteStream: callRemoteStream,
    localStream: callLocalStream,
    isMuted: isCallMuted,
    isCameraOff: isCallCameraOff,
    errorMessage: callErrorMessage,
    noticeMessage: callNoticeMessage,
    startCall,
    acceptCall,
    hangUp: hangUpCall,
    toggleMute: toggleCallMute,
    toggleCamera: toggleCallCamera,
  } = useCallSignaling({ socket, accessToken: user?.token });

  // ── Navigation ────────────────────────────────────────────────────────
  const roomNav = useCollapseNav({ defaultCollapsed: true });
  const conversationsNav = useCollapseNav();


  const handleBlockSuccess = useCallback(() => {
    const base = isAdmin ? paths.adminDashboard.chat : paths.dashboard.chat;
    router.push(base);
  }, [isAdmin, router]);

  const handleConversationSelect = useCallback(
    ({ conversationId, objectId }) => {
      const base = isAdmin ? paths.adminDashboard.chat : paths.dashboard.chat;
      router.push(base, { state: { conversationId, objectId } });
    },
    [isAdmin, router]
  );

  const handleRetryMessage = useCallback(
    async (message) => {
      const optimisticId = message._id;
      if (!message._retryPayload || !optimisticId) return;

      setLiveMessages((prev) => prev.map((m) => (m._id === optimisticId ? { ...m, _sendState: 'pending' } : m)));

      try {
        const res = await retrySendMessage(message._retryPayload).unwrap();
        handleMessageSettled(optimisticId, res?.data?._id ? res.data : null);

        if (!message._retryPayload.conversationId && res?.data?.conversationId) {
          handleConversationSelect({ conversationId: res.data.conversationId, objectId: objectIdParam });
        }
      } catch (err) {
        console.error('Retry send message failed:', err);
        handleMessageFailed(optimisticId);
      }
    },
    [retrySendMessage, handleMessageSettled, handleMessageFailed, handleConversationSelect, objectIdParam]
  );

  const lastKnownConvKeyRef = useRef('');
  const lastKnownOtherUser = useRef(null);
  const lastKnownChatRef = useRef(null);

  // Stable key that uniquely identifies the open conversation across tab switches
  const currentConvKey = conversationIdParam || objectIdParam;

  const otherUser = useMemo(() => {
    if (activeChat) {
      lastKnownConvKeyRef.current = currentConvKey;
      lastKnownOtherUser.current = {
        _id: activeChat.objectId,
        name: decodeHtmlEntities(activeChat.chatName),
        avatarUrl: normalizeImageUrl(activeChat.chatIcon),
        isOnline: activeChat.isOnline,
        conversationId: activeChat.conversationId,
      };
      return lastKnownOtherUser.current;
    }

    // Same conversation, different tab: return cached info (name, avatar stay correct)
    if (lastKnownConvKeyRef.current === currentConvKey && lastKnownOtherUser.current) {
      return lastKnownOtherUser.current;
    }

    // Different conversation or first open: fall back to URL params.
    // Also check the cache — URL params are cleared when handleConversationSelect
    // rewrites the URL after the first message creates a new conversationId, but
    // the cache (keyed by objectId) still holds the name/avatar from the original navigation.
    if (objectIdParam) {
      const cached = cachedUrlUserInfoRef.current?.objectId === objectIdParam ? cachedUrlUserInfoRef.current : null;
      return {
        _id: objectIdParam,
        name: decodeHtmlEntities(nameParam) || cached?.name || 'User',
        avatarUrl: normalizeImageUrl(profileIconParam) || cached?.avatarUrl || '',
        isOnline: onlineStatusMap[objectIdParam] ?? false,
      };
    }

    return null;
  }, [activeChat, currentConvKey, objectIdParam, nameParam, profileIconParam, onlineStatusMap]);

  // ── Chat state (blocked / favourite) ─────────────────────────────────
  // Same key-based cache strategy as otherUser above.
  const effectiveChat = useMemo(() => {
    if (activeChat) {
      lastKnownChatRef.current = activeChat;
      return activeChat;
    }
    if (lastKnownConvKeyRef.current === currentConvKey && lastKnownChatRef.current) {
      return lastKnownChatRef.current;
    }
    return null;
  }, [activeChat, currentConvKey]);

  const isBlocked = effectiveChat?.chatState === 'blocked';
  const isFavourite = effectiveChat?.chatState === 'favorite';
  const isArchived = effectiveChat?.chatState === 'archived';
  // Defaults to true when there's no chat yet (brand-new conversation, not in the list
  // until the first message is sent) — only an explicit false from the API blocks sending.
  const canMessage = effectiveChat?.canMessage !== false;
  const [unblockLoading, setUnblockLoading] = useState(false);
  const [updateChatAction] = useUpdateChatActionMutation();

  const handleChatStateChanged = useCallback((conversationId, newChatState) => {
    if (lastKnownChatRef.current?.conversationId === conversationId) {
      lastKnownChatRef.current = { ...lastKnownChatRef.current, chatState: newChatState };
    }
  }, []);

  const handleUnblock = useCallback(async () => {
    if (!derivedConversationId) return;
    setUnblockLoading(true);
    try {
      await updateChatAction({ conversationId: derivedConversationId, action: 'default' }).unwrap();
      handleChatStateChanged(derivedConversationId, 'default');
    } catch (err) {
      console.error(err);
    } finally {
      setUnblockLoading(false);
    }
  }, [derivedConversationId, updateChatAction, handleChatStateChanged]);

  const handleStartCall = useCallback(
    (mode = 'audio') => {
      if (!isConversationSelected || !otherUser?._id) return;
      startCall(otherUser, mode);
    },
    [isConversationSelected, otherUser, startCall]
  );

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        {t('chat')}
      </Typography>

      <Layout
        sx={{
          minHeight: 0,
          flex: '1 1 0',
          borderRadius: 2,
          position: 'relative',
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows.card,
        }}
        slots={{
          header: isConversationSelected ? (
            <ChatHeaderDetail
              collapseNav={roomNav}
              otherUser={otherUser}
              conversationId={derivedConversationId}
              loading={messagesLoading}
              isAdmin={isAdmin}
              isBlocked={isBlocked}
              isFavourite={isFavourite}
              isArchived={isArchived}
              onBlockSuccess={handleBlockSuccess}
              onChatStateChanged={handleChatStateChanged}
              onDeleteSuccess={handleBlockSuccess}
              onStartCall={handleStartCall}
            />
          ) : null,

          nav: (
            <ChatNav
              chats={chats}
              loading={chatsLoading}
              selectedConversationId={conversationIdParam}
              selectedObjectId={objectIdParam}
              collapseNav={conversationsNav}
              onSelectConversation={handleConversationSelect}
              isAdmin={isAdmin}
              currentTab={currentTab}
              onTabChange={handleTabChange}
              isFetching={chatsFetching}
              onBlockConversation={handleBlockSuccess}
              onChatStateChanged={handleChatStateChanged}
              searchQuery={searchDisplayValue}
              onSearchChange={handleSearchChange}
            />
          ),

          main: (
            <>
              {isConversationSelected ? (
                <ChatMessageList
                  messages={allMessages}
                  myId={myId}
                  otherUser={otherUser}
                  loading={messagesLoading || (messagesFetching && allMessages.length === 0)}
                  hasMore={hasMore}
                  isLoadingMore={loadingMore}
                  onLoadMore={handleLoadMore}
                  onDeleteMessage={handleDeleteMessage}
                  onRetryMessage={handleRetryMessage}
                />
              ) : (
                <EmptyContent
                  imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-chat-active.svg`}
                  title={t('startConversationTitle')}
                  description={t('selectChatToStartMessaging')}
                />
              )}

              {isConversationSelected &&
                (isBlocked ? (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={2}
                    sx={{
                      px: 3,
                      height: 56,
                      flexShrink: 0,
                      borderTop: (theme) => `solid 1px ${theme.vars.palette.divider}`,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('conversationBlockedNotice')}
                    </Typography>
                    <Button size="small" variant="outlined" disabled={unblockLoading} onClick={handleUnblock}>
                      {unblockLoading ? t('unblocking') : t('unblock')}
                    </Button>
                  </Stack>
                ) : !canMessage ? (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={1.5}
                    sx={{
                      px: 3,
                      py: 1.5,
                      minHeight: 56,
                      flexShrink: 0,
                      borderTop: (theme) => `solid 1px ${theme.vars.palette.divider}`,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        flexShrink: 0,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                      }}
                    >
                      <Iconify icon="solar:lock-keyhole-minimalistic-bold" width={16} sx={{ color: 'primary.main' }} />
                    </Box>
                    <Stack spacing={0}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.4, color: 'primary.darker' }}>
                        {t('chatSessionEndedTitle')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.dark' }}>
                        {t('chatSessionEndedDescription')}
                      </Typography>
                    </Stack>
                  </Stack>
                ) : (
                  <ChatMessageInput
                    conversationId={derivedConversationId}
                    objectId={objectIdParam}
                    bookingId={bookingIdParam}
                    myId={myId}
                    onConversationCreated={handleConversationSelect}
                    onMessageSent={(msg) => setLiveMessages((prev) => [...prev, msg])}
                    onMessageSettled={handleMessageSettled}
                    onMessageFailed={handleMessageFailed}
                  />
                ))}
            </>
          ),

          details: isConversationSelected && <ChatRoom collapseNav={roomNav} otherUser={otherUser} bookings={effectiveChat?.bookingIds || []} loading={messagesLoading} />,
        }}
      />

      <ChatCallScreen
        open={callState !== 'idle'}
        mode={callMode}
        phase={callState}
        otherUser={callPeer}
        remoteStream={callRemoteStream}
        localStream={callLocalStream}
        isMuted={isCallMuted}
        isCameraOff={isCallCameraOff}
        errorMessage={callErrorMessage}
        noticeMessage={callNoticeMessage}
        onToggleMute={toggleCallMute}
        onToggleCamera={toggleCallCamera}
        onClose={hangUpCall}
        onAccept={acceptCall}
        onDecline={hangUpCall}
      />
    </DashboardContent>
  );
}
