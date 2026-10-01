import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';

import { Section } from './section';
import { Main, Content } from './main';
import { HeaderBase } from '../core/header-base';
import { LayoutSection } from '../core/layout-section';

// ----------------------------------------------------------------------

export function AuthSplitLayout({ sx, section, children }) {
  const theme = useTheme();
  const mobileNavOpen = useBoolean();
  const pathname = usePathname();

  const layoutQuery = 'md';
  const isPasswordRecoveryRoute =
    pathname.includes('/forget-password') || pathname.includes('/verify-otp') || pathname.includes('/verify-account') || pathname.includes('/reset-password');
  const isLoginRoute =
    pathname === '/' || pathname === '/login' || pathname === '/admin/login' || pathname.includes('/sign-in');
  const isSignUpRoute = pathname.includes('/sign-up') || pathname.includes('/verify-account');
  const hasAuthBackground = isLoginRoute || isPasswordRecoveryRoute || isSignUpRoute;
  const hideAuthHeaderLogoOnDesktop = isLoginRoute || isPasswordRecoveryRoute || isSignUpRoute;
  const authBackground = 'linear-gradient(180deg, #fff3d8 0%, #fff8e8 44%, #ffffff 100%)';

  return (
    <LayoutSection
      headerSection={
        /** **************************************
         * Header
         *************************************** */
        <HeaderBase
          disableElevation
          disableOffset={hasAuthBackground}
          layoutQuery={layoutQuery}
          onOpenNav={mobileNavOpen.onTrue}
          slotsDisplay={{
            logo: true,
            signIn: false,
            account: false,
            purchase: false,
            contacts: false,
            searchbar: false,
            workspaces: false,
            menuButton: false,
            localization: false,
            notifications: false,
          }}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
          }}
          slotProps={{
            container: { maxWidth: false },
            toolbar: {
              sx: {
                position: 'relative',
                [`& [data-slot="divider"]`]: { display: 'none' },
                [`& [data-slot="logo"]`]: {
                  [theme.breakpoints.down(layoutQuery)]: {
                    position: 'absolute',
                    top: 12,
                    left: '50%',
                    zIndex: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'translateX(-50%)',
                    transition: 'transform 120ms ease',
                    '&:active': {
                      transform: 'translateX(-50%) scale(0.98)',
                    },
                    '& img': {
                      width: 'auto',
                      height: 56,
                      display: 'block',
                    },
                  },
                },
                ...(hideAuthHeaderLogoOnDesktop && {
                  [theme.breakpoints.up(layoutQuery)]: {
                    [`& [data-slot="logo"], & [data-slot="divider"]`]: { display: 'none' },
                  },
                }),
              },
            },
          }}
          sx={{ position: { [layoutQuery]: 'fixed' } }}
        />
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      sx={{
        ...(hasAuthBackground && {
          background: authBackground,
          backgroundColor: '#fff8e8',
        }),
        ...sx,
      }}
      cssVars={{
        '--layout-auth-content-width': '420px',
      }}
    >
      <Main
        layoutQuery={layoutQuery}
        sx={{
          ...(hasAuthBackground && {
            minHeight: {
              xs: 'calc(100svh - var(--layout-header-mobile-height))',
              [layoutQuery]: '100vh',
            },
            background: authBackground,
            backgroundColor: '#fff8e8',
          }),
        }}
      >
        <Section
          title={section?.title}
          layoutQuery={layoutQuery}
          imgUrl={section?.imgUrl}
          method={CONFIG.auth.method}
          subtitle={section?.subtitle}
          sx={
            hasAuthBackground
              ? {
                  background: authBackground,
                  backgroundColor: '#fff8e8',
                  ...section?.sx,
                }
              : section?.sx
          }
          methods={[
            {
              label: 'Jwt',
              path: paths.auth.jwt.signIn,
              icon: `${CONFIG.site.basePath}/assets/icons/platforms/ic-jwt.svg`,
            },
            {
              label: 'Firebase',
              path: paths.auth.firebase.signIn,
              icon: `${CONFIG.site.basePath}/assets/icons/platforms/ic-firebase.svg`,
            },
            {
              label: 'Amplify',
              path: paths.auth.amplify.signIn,
              icon: `${CONFIG.site.basePath}/assets/icons/platforms/ic-amplify.svg`,
            },
            {
              label: 'Auth0',
              path: paths.auth.auth0.signIn,
              icon: `${CONFIG.site.basePath}/assets/icons/platforms/ic-auth0.svg`,
            },
            {
              label: 'Supabase',
              path: paths.auth.supabase.signIn,
              icon: `${CONFIG.site.basePath}/assets/icons/platforms/ic-supabase.svg`,
            },
          ]}
        />
        <Content
          layoutQuery={layoutQuery}
          sx={{
            ...(hasAuthBackground && {
              background: authBackground,
              backgroundColor: '#fff8e8',
              px: { xs: 3, sm: 2 },
              py: { xs: 3, [layoutQuery]: 'calc(var(--layout-header-desktop-height) + 24px)' },
            }),
          }}
        >
          {children}
        </Content>
      </Main>
    </LayoutSection>
  );
}
