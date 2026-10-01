const PASSWORD_RESET_SOURCE_KEY = 'upnext_password_reset_source';
const PASSWORD_RESET_EMAIL_KEY = 'upnext_password_reset_email';
const PASSWORD_RESET_TOKEN_KEY = 'upnext_password_reset_token';

export function setPasswordResetSource(source) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PASSWORD_RESET_SOURCE_KEY, source);
}

export function getPasswordResetSource() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(PASSWORD_RESET_SOURCE_KEY);
}

export function clearPasswordResetSource() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PASSWORD_RESET_SOURCE_KEY);
}

export function setPasswordResetEmail(email) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PASSWORD_RESET_EMAIL_KEY, email);
}

export function getPasswordResetEmail() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(PASSWORD_RESET_EMAIL_KEY);
}

export function setPasswordResetToken(token) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PASSWORD_RESET_TOKEN_KEY, token);
}

export function getPasswordResetToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(PASSWORD_RESET_TOKEN_KEY);
}

export function clearPasswordResetStorage() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PASSWORD_RESET_SOURCE_KEY);
  window.localStorage.removeItem(PASSWORD_RESET_EMAIL_KEY);
  window.localStorage.removeItem(PASSWORD_RESET_TOKEN_KEY);
}
