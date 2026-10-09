import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { getFcmToken } from 'src/lib/firebase-messaging';
import { fetchGoogleAccount, loadGoogleIdentity } from 'src/lib/google-identity-loader';
import { useSocialAuthMutation } from 'src/store/Reducer/auth';
import { setUser } from 'src/store/slices/userSlice';
import { varAlpha } from 'src/theme/styles';

import { goToPostLogin } from './auth-redirect-storage';

// ----------------------------------------------------------------------

function GoogleLogo() {
  return (
    <Box component="svg" viewBox="0 0 48 48" aria-hidden sx={{ width: 22, height: 22, flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function GoogleSignInButton({ role = 'customer', label = 'Continue with Google', dividerAfter = false, onError }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [socialAuth] = useSocialAuthMutation();

  const tokenClientRef = useRef(null);
  const deviceTokenRef = useRef(null);
  const completeRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [busy, setBusy] = useState(false);

  const clientId = CONFIG.google.clientId;

  completeRef.current = async (tokenResponse) => {
    if (!tokenResponse?.access_token) {
      setBusy(false);
      if (tokenResponse?.error && tokenResponse.error !== 'access_denied') {
        onError?.('Google sign-in failed. Please try again.');
      }
      return;
    }

    try {
      const [account, deviceToken] = await Promise.all([fetchGoogleAccount(tokenResponse.access_token), deviceTokenRef.current]);

      const result = await socialAuth({
        provider: 'google',
        socialId: account.sub,
        email: account.email,
        name: account.name,
        accessToken: tokenResponse.access_token,
        userType: role === 'provider' ? 'business' : 'user',
        deviceId: deviceToken || 'web',
        deviceType: 'web',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).unwrap();

      const user = result?.data;
      if (!user) {
        onError?.('Google sign-in failed: no account data was returned.');
        return;
      }

      if (!user.accountState?.status) {
        onError?.('Your account is inactive. Please contact support.');
        return;
      }

      const userType = user.accountState?.userType;
      if (['user', 'customer'].includes(userType) && user.profile?.status && user.profile.status !== 'active') {
        onError?.('Your profile is not active. Please contact support.');
        return;
      }

      const permission = userType === 'admin' || userType === 'subadmin' ? 1 : 2;
      dispatch(setUser({ ...user, permission }));
      goToPostLogin(router, paths, permission, userType, user.profile);
    } catch (error) {
      const message = error?.data?.message || error?.message;
      onError?.(typeof message === 'string' ? message : 'Google sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!clientId) return undefined;

    let cancelled = false;

    loadGoogleIdentity()
      .then((accounts) => {
        if (cancelled) return;

        tokenClientRef.current = accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: (tokenResponse) => completeRef.current?.(tokenResponse),
          error_callback: () => setBusy(false),
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const handleClick = () => {
    if (!tokenClientRef.current) return;

    onError?.('');
    setBusy(true);
    deviceTokenRef.current = getFcmToken().catch(() => null);
    tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
  };

  if (!clientId || unavailable) return null;

  const divider = (
    <Divider sx={{ my: dividerAfter ? 0 : 3, mt: dividerAfter ? 2.5 : 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
      <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 600 }}>
        OR
      </Typography>
    </Divider>
  );

  return (
    <Box>
      {!dividerAfter && divider}

      <Button
        fullWidth
        size="large"
        color="inherit"
        variant="outlined"
        disabled={!ready || busy}
        onClick={handleClick}
        startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <GoogleLogo />}
        sx={{
          gap: 0.5,
          fontWeight: 700,
          color: 'text.primary',
          bgcolor: 'common.white',
          borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.32),
          boxShadow: (theme) => `0 1px 2px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.06)}`,
          transition: (theme) => theme.transitions.create(['border-color', 'box-shadow', 'background-color']),
          '&:hover': {
            bgcolor: 'common.white',
            borderColor: 'primary.main',
            boxShadow: (theme) => `0 8px 20px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.2)}`,
          },
          '&.Mui-disabled': { bgcolor: 'common.white', color: 'text.secondary' },
        }}
      >
        {label}
      </Button>

      {dividerAfter && divider}
    </Box>
  );
}
