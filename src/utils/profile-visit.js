import { getLastTouchTrafficSource, getTrafficPayload } from './traffic-source';

const STORAGE_KEY = 'profileVisits';

const pending = new Set();

function readVisits() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getProfileVisitSource() {
  return getLastTouchTrafficSource()?.source || getTrafficPayload()?.source || 'direct';
}

export function claimProfileVisit(profileId, source) {
  const key = `${profileId}:${source}`;
  if (pending.has(key) || readVisits()[key]) return null;
  pending.add(key);
  return key;
}

export function settleProfileVisit(key, recorded) {
  if (recorded) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readVisits(), [key]: Date.now() }));
      return;
    } catch {
      return;
    }
  }
  pending.delete(key);
}
