import { useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import CircularProgress from '@mui/material/CircularProgress';

import { useResponsive } from 'src/hooks/use-responsive';
import { useTranslate } from 'src/locales/use-locales';

import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { ToggleButton } from './styles';
import { ChatNavItem } from './chat-nav-item';
import { ChatNavAccount } from './chat-nav-account';
import { ChatNavItemSkeleton } from './chat-skeleton';

// ----------------------------------------------------------------------

const NAV_WIDTH = 320;
const NAV_COLLAPSE_WIDTH = 96;

const CHAT_TABS = [
  { value: 'inbox', labelKey: 'inbox' },
  { value: 'favourites', labelKey: 'favourites' },
  { value: 'archived', labelKey: 'archived' },
  { value: 'blocked', labelKey: 'blocked' },
];

// ----------------------------------------------------------------------

export function ChatNav({
  loading,
  chats,
  collapseNav,
  selectedConversationId,
  selectedObjectId,
  onSelectConversation,
  currentTab,
  onTabChange,
  isFetching,
  onBlockConversation,
  onChatStateChanged,
  searchQuery,
  onSearchChange,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const mdUp = useResponsive('up', 'md');

  const { openMobile, onOpenMobile, onCloseMobile, onCloseDesktop, collapseDesktop, onCollapseDesktop } = collapseNav;

  useEffect(() => {
    if (!mdUp) onCloseDesktop();
  }, [onCloseDesktop, mdUp]);

  const handleToggleNav = useCallback(() => {
    if (mdUp) onCollapseDesktop();
    else onCloseMobile();
  }, [mdUp, onCloseMobile, onCollapseDesktop]);

  const renderLoading = <ChatNavItemSkeleton />;

  const renderList = (
    <nav>
      <Box component="ul">
        {chats.map((chat) => {
          const isSelected =
            chat.conversationId === selectedConversationId ||
            chat.objectId === selectedObjectId;

          return (
            <ChatNavItem
              key={chat.conversationId || chat.objectId}
              collapse={collapseDesktop}
              chat={chat}
              selected={isSelected}
              onCloseMobile={onCloseMobile}
              onSelect={onSelectConversation}
              onBlockSuccess={isSelected && currentTab !== 'blocked' ? onBlockConversation : undefined}
              onChatStateChanged={onChatStateChanged}
              onDeleteSuccess={isSelected ? onBlockConversation : undefined}
            />
          );
        })}
      </Box>
    </nav>
  );

  const renderEmptyState = (
    <Stack spacing={0.5} alignItems="center" sx={{ px: 2.5, py: 6, textAlign: 'center' }}>
      <Iconify icon="solar:chat-round-dots-bold" width={28} sx={{ color: 'text.disabled' }} />
      <Typography variant="subtitle2">
        {t('noChatsInCategory', { category: t(CHAT_TABS.find((tab) => tab.value === currentTab)?.labelKey) })}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {t('chatsWillAppearHere')}
      </Typography>
    </Stack>
  );

  const renderSearchInput = (
    <ClickAwayListener onClickAway={() => {}}>
      <TextField
        fullWidth
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={t('searchChatsPlaceholder')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mt: 2.5,
          '& .MuiOutlinedInput-root': {
            borderRadius: 999,
            bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            '& fieldset': { border: 'none' },
            '&:hover': { bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.14) },
            '&.Mui-focused': { bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.14) },
          },
        }}
      />
    </ClickAwayListener>
  );

  const renderTabs = (
    <Box sx={{ pt: 1.25 }}>
      <Tabs
        value={currentTab}
        onChange={onTabChange}
        variant="fullWidth"
        sx={{
          minHeight: 36,
          p: 0.5,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
          '& .MuiTabs-flexContainer': { gap: 0.5 },
          '& .MuiTabs-indicator': { display: 'none' },
        }}
      >
        {CHAT_TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            disableRipple
            label={
              tab.value === currentTab && isFetching ? (
                <CircularProgress size={11} color="inherit" />
              ) : (
                t(tab.labelKey)
              )
            }
            sx={{
              px: 0.75,
              py: 0.5,
              minHeight: 28,
              minWidth: 0,
              borderRadius: 1,
              textTransform: 'none',
              fontSize: 11,
              fontWeight: 600,
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
                bgcolor: 'background.paper',
                boxShadow: (t) => t.customShadows.z8,
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );

  const renderContent = (
    <>
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ p: 2.5, pb: 0 }}>
        {!collapseDesktop && (
          <>
            <ChatNavAccount />
            <Box sx={{ flexGrow: 1 }} />
          </>
        )}

        <IconButton onClick={handleToggleNav}>
          <Iconify icon={collapseDesktop ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'} />
        </IconButton>
      </Stack>

      <Box sx={{ px: 2.5, pt: 0, pb: 1 }}>
        {!collapseDesktop && (
          <>
            {renderSearchInput}
            {renderTabs}
          </>
        )}
      </Box>

      {loading ? (
        renderLoading
      ) : (
        <Scrollbar sx={{ pb: 1 }}>
          {chats.length ? renderList : renderEmptyState}
        </Scrollbar>
      )}
    </>
  );

  return (
    <>
      <ToggleButton onClick={onOpenMobile} sx={{ display: { md: 'none' } }}>
        <Iconify width={16} icon="solar:users-group-rounded-bold" />
      </ToggleButton>

      <Stack
        sx={{
          minHeight: 0,
          flex: '1 1 auto',
          width: NAV_WIDTH,
          display: { xs: 'none', md: 'flex' },
          borderRight: `solid 1px ${theme.vars.palette.divider}`,
          transition: theme.transitions.create(['width'], {
            duration: theme.transitions.duration.shorter,
          }),
          ...(collapseDesktop && { width: NAV_COLLAPSE_WIDTH }),
        }}
      >
        {renderContent}
      </Stack>

      <Drawer
        open={openMobile}
        onClose={onCloseMobile}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: NAV_WIDTH } }}
      >
        {renderContent}
      </Drawer>
    </>
  );
}
