import { useMemo } from 'react';

import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useBoolean } from 'src/hooks/use-boolean';

import { allLangs } from 'src/locales';
import { _contacts, _notifications } from 'src/_mock';
import { varAlpha, stylesMode } from 'src/theme/styles';
import { useTranslateNav } from 'src/locales/use-locales';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { bulletColor } from 'src/components/nav-section';
import { useSettingsContext } from 'src/components/settings';

import { useSelector } from 'react-redux';

import { useChatSocketContext } from 'src/sections/chat/chat-socket-provider';
import { LiveOffersContext, useLiveOffersState } from 'src/sections/live-offers/live-offers-context';
import { IncomingOfferNotification } from 'src/sections/live-offers/incoming-offer-notification';
import { ActiveRequestPill } from 'src/sections/instant-request/active-request-pill';

import { Main } from './main';
import { NavMobile } from './nav-mobile';
import { layoutClasses } from '../classes';
import { NavVertical } from './nav-vertical';
import { NavHorizontal } from './nav-horizontal';
import { getNavData as getAccountNavData } from '../config-nav-account';
import { HeaderBase } from '../core/header-base';
import { getWorkspacesData } from '../config-nav-workspace';
import { LayoutSection } from '../core/layout-section';
import { getNavData as getDashboardNavData } from '../config-nav-dashboard';
import { getNavData as getAdminNavData } from '../config-nav-admin-dashboard';
import { getNavData as getCustomerNavData } from '../config-nav-customer';
import { getNavData as getProviderNavData } from '../config-nav-provider';

// ----------------------------------------------------------------------

export function DashboardLayout({ sx, children, data }) {
  const theme = useTheme();

  const mobileNavOpen = useBoolean();

  const { user } = useSelector((state) => state.user);

  const settings = useSettingsContext();

  const navColorVars = useNavColorVars(theme, settings);

  const layoutQuery = 'lg';

  const t = useTranslateNav();

  const { totalUnreadCount } = useChatSocketContext();

  const isProviderUser = user?.permission === 2 && (user?.accountState?.userType === 'provider' || user?.accountState?.userType === 'business');
  const liveOffers = useLiveOffersState(isProviderUser);
  const incomingOffersCount = liveOffers.counts.incoming;

  // const navData = data?.nav ?? getDashboardNavData(t);

  const navData = useMemo(() => {
    let base;

    if (user?.permission === 1) {
      base = getAdminNavData(t);
    } else if (user?.permission === 2) {
      if (user?.accountState?.userType === 'provider' || user?.accountState?.userType === 'business') {
        base = getProviderNavData(t);
      } else if (user?.accountState?.userType === 'customer' || user?.accountState?.userType === 'user') {
        base = getCustomerNavData(t);
      } else {
        // fallback for other user types with permission 2
        base = getDashboardNavData(t);
      }
    } else {
      base = data?.nav ?? getDashboardNavData(t);
    }

    if (!totalUnreadCount && !incomingOffersCount) return base;

    return base.map((section) => ({
      ...section,
      items: section.items.map((item) => {
        if (item.path === paths.dashboard.liveOffers && incomingOffersCount) {
          return {
            ...item,
            info: (
              <Label color="error" variant="filled" sx={{ height: 16, minWidth: 16, px: 0.5, fontSize: 10, lineHeight: 1 }}>
                {incomingOffersCount > 99 ? '99+' : incomingOffersCount}
              </Label>
            ),
          };
        }
        return item.path === paths.dashboard.chat && totalUnreadCount
          ? {
            ...item,
            info: (
              <Label
                color="primary"
                variant="filled"
                sx={{
                  height: 16,
                  minWidth: 16,
                  px: 0.5,
                  fontSize: 10,
                  lineHeight: 1,
                }}
              >
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </Label>
            ),
          }
          : item;
      }),
    }));
  }, [user?.permission, user?.accountState?.userType, data?.nav, t, totalUnreadCount, incomingOffersCount]);

  const isAdmin = user?.permission === 1;
  const isProvider = user?.permission === 2 && (user?.accountState?.userType === 'provider' || user?.accountState?.userType === 'business');

  const searchNavData = useMemo(() => {
    const extraItems = [
      {
        title: t('profile'),
        path: isAdmin ? paths.adminDashboard.profile : paths.dashboard.profile,
        icon: <Iconify icon="solar:user-circle-bold-duotone" width={18} />,
      },
    ];

    if (isProvider) {
      extraItems.push(
        {
          title: t('businessProfile'),
          path: paths.dashboard.businessProfile,
          icon: <Iconify icon="solar:shop-bold-duotone" width={18} />,
        },
        {
          title: t('revenue'),
          path: paths.dashboard.revenue,
          icon: <Iconify icon="solar:wallet-money-bold-duotone" width={18} />,
        },
        {
          title: t('payoutMethod'),
          path: paths.dashboard.appSettings.connectPayoutMethod,
          icon: <Iconify icon="solar:card-transfer-bold-duotone" width={18} />,
        }
      );
    }

    return [...navData, { subheader: t('settings'), items: extraItems }];
  }, [navData, isAdmin, isProvider, t]);

  const accountNavData = useMemo(
    () => getAccountNavData({ isProvider: user?.accountState?.userType === 'provider' || user?.accountState?.userType === 'business' }),
    [user?.accountState?.userType]
  );

  const isNavMini = settings.navLayout === 'mini';

  const isNavHorizontal = settings.navLayout === 'horizontal';

  const isNavVertical = isNavMini || settings.navLayout === 'vertical';

  return (
    <LiveOffersContext.Provider value={liveOffers}>
      <NavMobile data={navData} open={mobileNavOpen.value} onClose={mobileNavOpen.onFalse} cssVars={navColorVars.section} />

      <LayoutSection
        /** **************************************
         * Header
         *************************************** */
        headerSection={
          <HeaderBase
            layoutQuery={layoutQuery}
            disableElevation={isNavVertical}
            onOpenNav={mobileNavOpen.onTrue}
            data={{
              nav: searchNavData,
              langs: allLangs,
              account: accountNavData,
              contacts: _contacts,
              workspaces: getWorkspacesData(t),
              notifications: _notifications,
            }}
            slotsDisplay={{
              signIn: false,
              purchase: false,
              helpLink: false,
            }}
            slots={{
              topArea: (
                <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                  This is an info Alert.
                </Alert>
              ),
              bottomArea: isNavHorizontal ? <NavHorizontal data={navData} layoutQuery={layoutQuery} cssVars={navColorVars.section} /> : null,
            }}
            slotProps={{
              toolbar: {
                sx: {
                  [`& [data-slot="logo"]`]: {
                    display: 'none',
                  },
                  [`& [data-area="right"]`]: {
                    gap: { xs: 0, sm: 0.75 },
                  },
                  ...(isNavHorizontal && {
                    bgcolor: 'var(--layout-nav-bg)',
                    [`& .${iconButtonClasses.root}`]: {
                      color: 'var(--layout-nav-text-secondary-color)',
                    },
                    [theme.breakpoints.up(layoutQuery)]: {
                      height: 'var(--layout-nav-horizontal-height)',
                    },
                    [`& [data-slot="workspaces"]`]: {
                      color: 'var(--layout-nav-text-primary-color)',
                    },
                    [`& [data-slot="logo"]`]: {
                      display: 'none',
                      [theme.breakpoints.up(layoutQuery)]: {
                        display: 'inline-flex',
                      },
                    },
                    [`& [data-slot="divider"]`]: {
                      [theme.breakpoints.up(layoutQuery)]: {
                        display: 'flex',
                      },
                    },
                  }),
                },
              },
              container: {
                maxWidth: false,
                sx: {
                  ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
                },
              },
            }}
          />
        }
        /** **************************************
         * Sidebar
         *************************************** */
        sidebarSection={
          isNavHorizontal ? null : (
            <NavVertical
              data={navData}
              isNavMini={isNavMini}
              layoutQuery={layoutQuery}
              cssVars={navColorVars.section}
              onToggleNav={() => settings.onUpdateField('navLayout', settings.navLayout === 'vertical' ? 'mini' : 'vertical')}
            />
          )
        }
        /** **************************************
         * Footer
         *************************************** */
        footerSection={null}
        /** **************************************
         * Style
         *************************************** */
        cssVars={{
          ...navColorVars.layout,
          '--layout-transition-easing': 'linear',
          '--layout-transition-duration': '120ms',
          '--layout-nav-mini-width': '88px',
          '--layout-nav-vertical-width': '300px',
          '--layout-nav-horizontal-height': '64px',
          '--layout-dashboard-content-pt': theme.spacing(1),
          '--layout-dashboard-content-pb': theme.spacing(8),
          '--layout-dashboard-content-px': theme.spacing(5),
        }}
        sx={{
          [`& .${layoutClasses.hasSidebar}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
              pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
            },
          },
          ...sx,
        }}
      >
        <Main isNavHorizontal={isNavHorizontal}>{children}</Main>
      </LayoutSection>

      {isProviderUser && <IncomingOfferNotification />}
      {user?.permission === 2 && (user?.accountState?.userType === 'user' || user?.accountState?.userType === 'customer') && <ActiveRequestPill />}
    </LiveOffersContext.Provider>
  );
}

// ----------------------------------------------------------------------

function useNavColorVars(theme, settings) {
  const {
    vars: { palette },
  } = theme;

  return useMemo(() => {
    switch (settings.navColor) {
      case 'integrate':
        return {
          layout: {
            '--layout-nav-bg': palette.background.default,
            '--layout-nav-horizontal-bg': varAlpha(palette.background.defaultChannel, 0.8),
            '--layout-nav-border-color': varAlpha(palette.grey['500Channel'], 0.12),
            '--layout-nav-text-primary-color': palette.text.primary,
            '--layout-nav-text-secondary-color': palette.text.secondary,
            '--layout-nav-text-disabled-color': palette.text.disabled,
            [stylesMode.dark]: {
              '--layout-nav-border-color': varAlpha(palette.grey['500Channel'], 0.08),
              '--layout-nav-horizontal-bg': varAlpha(palette.background.defaultChannel, 0.96),
            },
          },
          section: {},
        };
      case 'apparent':
        return {
          layout: {
            '--layout-nav-bg': palette.grey[900],
            '--layout-nav-horizontal-bg': varAlpha(palette.grey['900Channel'], 0.96),
            '--layout-nav-border-color': 'transparent',
            '--layout-nav-text-primary-color': palette.common.white,
            '--layout-nav-text-secondary-color': palette.grey[500],
            '--layout-nav-text-disabled-color': palette.grey[600],
            [stylesMode.dark]: {
              '--layout-nav-bg': palette.grey[800],
              '--layout-nav-horizontal-bg': varAlpha(palette.grey['800Channel'], 0.8),
            },
          },
          section: {
            // caption
            '--nav-item-caption-color': palette.grey[600],
            // subheader
            '--nav-subheader-color': palette.grey[600],
            '--nav-subheader-hover-color': palette.common.white,
            // item
            '--nav-item-color': palette.grey[500],
            '--nav-item-root-active-color': palette.primary.light,
            '--nav-item-root-open-color': palette.common.white,
            // bullet
            '--nav-bullet-light-color': bulletColor.dark,
            // sub
            ...(settings.navLayout === 'vertical' && {
              '--nav-item-sub-active-color': palette.common.white,
              '--nav-item-sub-open-color': palette.common.white,
            }),
          },
        };
      default:
        throw new Error(`Invalid color: ${settings.navColor}`);
    }
  }, [
    palette.background.default,
    palette.background.defaultChannel,
    palette.common.white,
    palette.grey,
    palette.primary.light,
    palette.text.disabled,
    palette.text.primary,
    palette.text.secondary,
    settings.navColor,
    settings.navLayout,
  ]);
}
