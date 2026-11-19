import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'upnext_active_instant_request';

const listeners = new Set();

function read() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

let current = typeof window !== 'undefined' ? read() : null;

function emit() {
  listeners.forEach((listener) => listener());
}

export function setActiveRequest(request) {
  current = request;
  try {
    if (request) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(request));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable; keep the in-memory copy.
  }
  emit();
}

export function updateActiveRequest(bookingId, updates) {
  if (!current || current.bookingId !== bookingId) return;
  setActiveRequest({ ...current, ...updates });
}

export function clearActiveRequest(bookingId) {
  if (!current || (bookingId && current.bookingId !== bookingId)) return;
  setActiveRequest(null);
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useActiveRequest() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
