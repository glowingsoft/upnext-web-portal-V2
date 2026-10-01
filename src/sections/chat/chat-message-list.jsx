import { useRef, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useTranslate } from 'src/locales/use-locales';

import { CONFIG } from 'src/config-global';
import { EmptyContent } from 'src/components/empty-content';
import { Scrollbar } from 'src/components/scrollbar';
import { Lightbox, useLightBox } from 'src/components/lightbox';

import { ChatMessageItem } from './chat-message-item';
import { ChatMessageListSkeleton } from './chat-skeleton';

// ----------------------------------------------------------------------

export function ChatMessageList({ messages = [], myId, otherUser, loading, hasMore, isLoadingMore, onLoadMore, onDeleteMessage, onRetryMessage }) {
  const { t } = useTranslate();
  const scrollbarRef = useRef(null);

  const savedScroll = useRef({ height: 0, top: 0 });

  // Track previous messages length so we know when new ones arrive
  const prevLenRef = useRef(0);
  const isInitialRef = useRef(true);
  
  useEffect(() => {
    const el = scrollbarRef.current;
    if (!el) return;

    const len = messages.length;

    if (isInitialRef.current || len === 0) {
      // First render — scroll to bottom
      isInitialRef.current = false;
      prevLenRef.current = len;
      el.scrollTop = el.scrollHeight;
      return;
    }

    if (savedScroll.current.height > 0) {
      // We just prepended older messages — restore relative position
      const diff = el.scrollHeight - savedScroll.current.height;
      el.scrollTop = savedScroll.current.top + diff;
      savedScroll.current = { height: 0, top: 0 };
    } else if (len > prevLenRef.current) {
      // New message appended at end (live) — scroll to bottom
      el.scrollTop = el.scrollHeight;
    }

    prevLenRef.current = len;
  }, [messages]);

  // Reset on unmount / conversation change so next mount starts fresh
  useEffect(
    () => () => {
      isInitialRef.current = true;
      prevLenRef.current = 0;
      savedScroll.current = { height: 0, top: 0 };
    },
    []
  );

  // Detect scroll-to-top to trigger load more
  const handleScroll = useCallback(() => {
    const el = scrollbarRef.current;
    if (!el || !hasMore || isLoadingMore) return;

    if (el.scrollTop < 80) {
      // Save current scroll state before prepend
      savedScroll.current = { height: el.scrollHeight, top: el.scrollTop };
      onLoadMore?.();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    const el = scrollbarRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const slides = messages.filter((msg) => msg.messageType === 'image').map((msg) => ({ src: msg.mediaUrl || msg.messageContent }));

  const lightbox = useLightBox(slides);

  if (loading) {
    return <ChatMessageListSkeleton />;
  }

  if (!messages.length) {
    return (
      <EmptyContent
        imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-chat-active.svg`}
        title={t('noMessagesYet')}
        description={otherUser?.name ? t('sayHelloToStart', { name: otherUser.name }) : t('sendMessageToStartConversation')}
      />
    );
  }

  return (
    <>
      <Scrollbar ref={scrollbarRef} sx={{ px: 3, pt: 5, pb: 3, flex: '1 1 auto' }}>
        {/* Load more indicator at top */}
        {isLoadingMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
            <CircularProgress size={20} color="inherit" />
          </Box>
        )}

        {messages.map((message, index) => {
          const prev = messages[index - 1];
          const next = messages[index + 1];
          const isFirstOfGroup = !prev || prev.senderId !== message.senderId;
          const isLastOfGroup = !next || next.senderId !== message.senderId;

          return (
            <ChatMessageItem
              key={message._id || message.id}
              message={message}
              myId={myId}
              otherUser={otherUser}
              isFirstOfGroup={isFirstOfGroup}
              isLastOfGroup={isLastOfGroup}
              onOpenLightbox={() => lightbox.onOpen(message.mediaUrl || message.messageContent)}
              onDelete={onDeleteMessage}
              onRetry={onRetryMessage}
            />
          );
        })}
      </Scrollbar>

      <Lightbox slides={slides} open={lightbox.open} close={lightbox.onClose} index={lightbox.selected} />
    </>
  );
}
