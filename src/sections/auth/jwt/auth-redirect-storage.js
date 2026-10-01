import { setSignupFlowStage, SIGNUP_FLOW_STAGE } from './sign-up/signup-flow-storage';

const AUTH_REDIRECT_PATH_KEY = 'upnext.authRedirectPath';

export function isSafeAuthRedirectPath(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');
}

export function setAuthRedirectPath(path) {
  if (typeof window === 'undefined' || !isSafeAuthRedirectPath(path)) return;

  window.localStorage.setItem(AUTH_REDIRECT_PATH_KEY, path);
}

export function getAuthRedirectPath() {
  if (typeof window === 'undefined') return null;

  const path = window.localStorage.getItem(AUTH_REDIRECT_PATH_KEY);

  if (!isSafeAuthRedirectPath(path)) {
    window.localStorage.removeItem(AUTH_REDIRECT_PATH_KEY);
    return null;
  }

  return path;
}

export function consumeAuthRedirectPath() {
  const path = getAuthRedirectPath();

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_REDIRECT_PATH_KEY);
  }

  return path;
}

// ----------------------------------------------------------------------
// Flag to signal that goTo() already handled post-login navigation,
// so GuestGuard should not override it.

const LOGIN_NAV_HANDLED_KEY = 'upnext.loginNavHandled';

export function markLoginNavHandled() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(LOGIN_NAV_HANDLED_KEY, '1');
  }
}

export function consumeLoginNavHandled() {
  if (typeof window === 'undefined') return false;
  const handled = window.sessionStorage.getItem(LOGIN_NAV_HANDLED_KEY) === '1';
  window.sessionStorage.removeItem(LOGIN_NAV_HANDLED_KEY);
  return handled;
}

// ----------------------------------------------------------------------
// Persist a service object across the login redirect so the detail page
// can show the correct service after sign-in.

const AUTH_SERVICE_KEY = 'upnext.authService';

export function setAuthService(service) {
  if (typeof window === 'undefined' || !service) return;
  try {
    window.sessionStorage.setItem(AUTH_SERVICE_KEY, JSON.stringify(service));
  } catch (_) {}
}

export function consumeAuthService() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(AUTH_SERVICE_KEY);
    window.sessionStorage.removeItem(AUTH_SERVICE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

// ----------------------------------------------------------------------
// Shared post-login redirect — used by both the plain sign-in flow and the 2FA verify-otp
// flow, so a login that completes via either path ends up in the same place.

export function goToPostLogin(router, paths, permission, userType, profile) {
  const storedRedirectPath = consumeAuthRedirectPath();
  const storedService = consumeAuthService();

  markLoginNavHandled();


  const isCustomerOrBusiness = userType === 'user' || userType === 'customer' || userType === 'business' || userType === 'provider';
  if (isCustomerOrBusiness && !profile) {
    setSignupFlowStage(SIGNUP_FLOW_STAGE.OTP);
    router.push(paths.auth.jwt.signUpComplete);
    return;
  }

  if (userType === 'user' || userType === 'customer') {
    if (storedRedirectPath) {
      router.push(storedRedirectPath, { state: { service: storedService } });
    } else {
      router.push(paths.dashboard.root);
    }
    return;
  }

  if (userType === 'business' || userType === 'provider') {
    router.push(paths.dashboard.root);
    return;
  }

  if (storedRedirectPath && permission === 1 && storedRedirectPath.startsWith(paths.adminDashboard.root)) {
    router.push(storedRedirectPath);
    return;
  }

  switch (permission) {
    case 1:
      router.push(paths.adminDashboard.root);
      break;
    default:
      router.push('/');
      break;
  }
}
