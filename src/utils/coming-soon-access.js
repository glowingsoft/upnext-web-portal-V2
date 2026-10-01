import { CONFIG } from 'src/config-global';

const STORAGE_KEY = 'upnext_coming_soon_access';

export function hasComingSoonAccess() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'granted';
  } catch {
    return false;
  }
}

export function grantComingSoonAccess(code) {
  const expected = CONFIG.site.comingSoonAccessCode;
  if (!expected || code !== expected) return false;

  try {
    localStorage.setItem(STORAGE_KEY, 'granted');
  } catch {
    // ignore — storage unavailable (private browsing, etc.)
  }
  return true;
}
