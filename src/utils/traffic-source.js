const FIRST_TOUCH_KEY = 'trafficSource';
const LAST_TOUCH_KEY = 'trafficSourceLastTouch';

const SCHEMA_VERSION = 2;

const MAX_URL_LENGTH = 2048;
const MAX_TAG_LENGTH = 100;

export const ATTRIBUTION_TYPES = ['organic_search', 'paid_search', 'social', 'email', 'campaign', 'referral', 'direct'];


const regionalDomain = (brand) => new RegExp(`(^|\\.)${brand}\\.((com|co)\\.[a-z]{2}|[a-z]{2,3})$`);

const SOURCE_RULES = [
  { source: 'gmail', attributionType: 'email', domains: ['mail.google.com'] },
  { source: 'yahoo_mail', attributionType: 'email', domains: ['mail.yahoo.com'] },
  { source: 'outlook', attributionType: 'email', domains: ['outlook.live.com', 'outlook.office.com', 'outlook.office365.com'] },
  { source: 'google', attributionType: 'organic_search', pattern: regionalDomain('google') },
  { source: 'bing', attributionType: 'organic_search', domains: ['bing.com'] },
  { source: 'yahoo', attributionType: 'organic_search', pattern: regionalDomain('yahoo') },
  { source: 'duckduckgo', attributionType: 'organic_search', domains: ['duckduckgo.com'] },
  { source: 'ecosia', attributionType: 'organic_search', domains: ['ecosia.org'] },
  { source: 'facebook', attributionType: 'social', domains: ['facebook.com', 'fb.com', 'fb.me'] },
  { source: 'instagram', attributionType: 'social', domains: ['instagram.com'] },
  { source: 'linkedin', attributionType: 'social', domains: ['linkedin.com', 'lnkd.in'] },
  { source: 'twitter', attributionType: 'social', domains: ['twitter.com', 'x.com', 't.co'] },
  { source: 'youtube', attributionType: 'social', domains: ['youtube.com', 'youtu.be'] },
  { source: 'tiktok', attributionType: 'social', domains: ['tiktok.com'] },
  { source: 'whatsapp', attributionType: 'social', domains: ['whatsapp.com', 'wa.me'] },
  { source: 'reddit', attributionType: 'social', domains: ['reddit.com', 'redd.it'] },
  { source: 'pinterest', attributionType: 'social', domains: ['pin.it'], pattern: regionalDomain('pinterest') },
  { source: 'teams', attributionType: 'social', domains: ['teams.microsoft.com', 'teams.live.com', 'teams.cloud.microsoft'] },
];

const ANDROID_APP_SOURCES = {
  'com.facebook.katana': { source: 'facebook', attributionType: 'social' },
  'com.facebook.lite': { source: 'facebook', attributionType: 'social' },
  'com.facebook.orca': { source: 'facebook', attributionType: 'social' },
  'com.instagram.android': { source: 'instagram', attributionType: 'social' },
  'com.linkedin.android': { source: 'linkedin', attributionType: 'social' },
  'com.twitter.android': { source: 'twitter', attributionType: 'social' },
  'com.zhiliaoapp.musically': { source: 'tiktok', attributionType: 'social' },
  'com.google.android.youtube': { source: 'youtube', attributionType: 'social' },
  'com.reddit.frontpage': { source: 'reddit', attributionType: 'social' },
  'com.pinterest': { source: 'pinterest', attributionType: 'social' },
  'com.whatsapp': { source: 'whatsapp', attributionType: 'social' },
  'com.microsoft.teams': { source: 'teams', attributionType: 'social' },
  'com.google.android.googlequicksearchbox': { source: 'google', attributionType: 'organic_search' },
  'com.google.android.gm': { source: 'gmail', attributionType: 'email' },
  'com.microsoft.office.outlook': { source: 'outlook', attributionType: 'email' },
};

// Hops that sit inside our own flows (payment checkout, OAuth sign-in) rather than bringing a
// visitor in. Returning from them must not be recorded as a new source.
const NON_ACQUISITION_DOMAINS = ['stripe.com', 'accounts.google.com', 'appleid.apple.com', 'paypal.com'];

// Query parameters whose values may be secrets or personal data; redacted before storing. Short
// words only match as a whole name part (api_key, auth-code) so keyword= or signup= are kept.
const SENSITIVE_PARAM =
  /token|secret|passw|signature|oobcode|(^|[_-])(pwd|auth|session|sid|code|otp|key|apikey|sig|email|phone|ssn)([_-]|$)/i;

// ----------------------------------------------------------------------

function defaultEnv() {
  const hasWindow = typeof window !== 'undefined';
  return {
    href: hasWindow ? window.location.href : '',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    storage: getBrowserStorage(),
    now: () => new Date(),
    isReload: isReloadNavigation(),
  };
}

// A reload or back/forward navigation keeps the original document.referrer, so it isn't a new visit.
function isReloadNavigation() {
  try {
    const type = performance.getEntriesByType('navigation')[0]?.type;
    return type === 'reload' || type === 'back_forward';
  } catch {
    return false;
  }
}

// Accessing localStorage itself can throw (Safari private mode, blocked site data, sandboxed iframes).
function getBrowserStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

const truncate = (value, max) => (typeof value === 'string' && value.length > max ? value.slice(0, max) : value);

function parseUrl(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/** True when `host` is `domain` or one of its subdomains (strict label boundary). */
export function matchesDomain(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}

/**
 * Best-effort registrable root (upnext.com, upnext.co.uk) used to treat our own subdomains as
 * internal. IPs and single-label hosts (localhost) only ever match themselves.
 */
function getSiteRoot(hostname) {
  if (!hostname || /^[\d.]+$/.test(hostname) || hostname.includes(':') || !hostname.includes('.')) return hostname;
  const labels = hostname.split('.');
  const secondLevel = labels[labels.length - 2];
  const isCountrySecondLevel = labels.length > 2 && labels[labels.length - 1].length === 2 && ['co', 'com', 'org', 'net', 'ac', 'gov', 'edu'].includes(secondLevel);
  return labels.slice(isCountrySecondLevel ? -3 : -2).join('.');
}

function isInternalHost(host, siteHostname) {
  const root = getSiteRoot(siteHostname);
  return host === siteHostname || (root && matchesDomain(host, root));
}

/**
 * Classifies a referrer URL against the current site.
 * Returns { kind: 'none' | 'internal' | 'external', source?, attributionType? }.
 */
export function classifyReferrer(referrer, siteHostname) {
  const url = parseUrl(referrer);
  if (url?.protocol === 'android-app:') {
    const app = ANDROID_APP_SOURCES[url.hostname.toLowerCase()];
    return app ? { kind: 'external', ...app } : { kind: 'external', source: 'referral', attributionType: 'referral' };
  }
  if (!url || !/^https?:$/.test(url.protocol)) return { kind: 'none' };

  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!host) return { kind: 'none' };

  if (isInternalHost(host, siteHostname) || NON_ACQUISITION_DOMAINS.some((domain) => matchesDomain(host, domain))) {
    return { kind: 'internal' };
  }

  const rule = SOURCE_RULES.find(
    (r) => r.domains?.some((domain) => matchesDomain(host, domain)) || r.pattern?.test(host)
  );
  return rule
    ? { kind: 'external', source: rule.source, attributionType: rule.attributionType }
    : { kind: 'external', source: 'referral', attributionType: 'referral' };
}

function attributionTypeForMedium(medium) {
  const value = (medium || '').toLowerCase();
  if (/^(cpc|ppc|paid|paidsearch|paid_search|paid-search)$/.test(value)) return 'paid_search';
  if (/^(email|e-mail|newsletter)$/.test(value)) return 'email';
  if (/^(social|social-media|social_media|paid_social|paidsocial)$/.test(value)) return 'social';
  if (value === 'organic') return 'organic_search';
  if (value === 'referral') return 'referral';
  return 'campaign';
}

const cleanTag = (value) => {
  const trimmed = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return trimmed ? truncate(trimmed, MAX_TAG_LENGTH) : null;
};

/** Landing URL with sensitive query values replaced by "[redacted]"; hash dropped. */
function sanitizeLandingUrl(url) {
  const safe = new URL(url.href);
  safe.hash = '';
  [...safe.searchParams.keys()].forEach((name) => {
    if (SENSITIVE_PARAM.test(name)) safe.searchParams.set(name, '[redacted]');
  });
  return truncate(safe.href, MAX_URL_LENGTH);
}

/** Referrer reduced to origin + path (no query or hash). */
function sanitizeReferrer(referrer) {
  const url = parseUrl(referrer);
  if (!url) return null;
  const origin = url.origin === 'null' ? `${url.protocol}//${url.hostname}` : url.origin;
  return truncate(`${origin}${url.pathname}`, MAX_URL_LENGTH);
}

export function getTrafficSource(env = defaultEnv()) {
  const url = parseUrl(env.href) || parseUrl('http://unknown.invalid/');
  const hostname = url.hostname.toLowerCase();
  const params = url.searchParams;
  const referrerInfo = classifyReferrer(env.referrer, hostname);

  const utmSource = cleanTag(params.get('utm_source'));
  const medium = cleanTag(params.get('utm_medium'));
  const campaign = cleanTag(params.get('utm_campaign'));

  let source;
  let attributionType;

  if (utmSource) {
    source = utmSource;
    attributionType = medium ? attributionTypeForMedium(medium) : 'campaign';
  } else if (params.has('gclid')) {
    source = 'google';
    attributionType = 'paid_search';
  } else if (params.has('msclkid')) {
    source = 'bing';
    attributionType = 'paid_search';
  } else if (referrerInfo.kind === 'external') {
    ({ source, attributionType } = referrerInfo);
  } else if (referrerInfo.kind !== 'internal' && params.has('fbclid')) {
    source = 'facebook';
    attributionType = 'social';
  } else {
    source = 'direct';
    attributionType = 'direct';
  }

  return {
    version: SCHEMA_VERSION,
    source,
    attributionType,
    medium,
    campaign,
    referrer: sanitizeReferrer(env.referrer),
    landingPage: sanitizeLandingUrl(url),
    landingPath: truncate(url.pathname, MAX_URL_LENGTH),
    hostname,
    firstVisitAt: env.now().toISOString(),
    // Internal for capture logic only; stripped before storing.
    isNewTouch: !env.isReload && source !== 'direct' && referrerInfo.kind !== 'internal',
  };
}

export function isValidTrafficRecord(record) {
  return (
    !!record &&
    typeof record === 'object' &&
    record.version === SCHEMA_VERSION &&
    typeof record.source === 'string' &&
    record.source.length > 0 &&
    ATTRIBUTION_TYPES.includes(record.attributionType) &&
    typeof record.landingPage === 'string' &&
    typeof record.landingPath === 'string' &&
    typeof record.firstVisitAt === 'string' &&
    !Number.isNaN(Date.parse(record.firstVisitAt))
  );
}

function readRecord(storage, key) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const record = JSON.parse(raw);
    if (isValidTrafficRecord(record)) return record;
    // Invalid or outdated (e.g. an unversioned v1 record): drop it. The next capture records the
    // current visit as first touch — the best information still available.
    storage.removeItem(key);
  } catch {
    // Unparseable JSON or storage access failure.
    try {
      storage.removeItem(key);
    } catch {
      // Storage unusable; callers fall back to the in-memory record.
    }
  }
  return null;
}

function writeRecord(storage, key, record) {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

let memoryFirstTouch = null;
let memoryLastTouch = null;

const stripInternal = ({ isNewTouch, ...record }) => record;

export function captureTrafficSource(env = defaultEnv()) {
  const current = getTrafficSource(env);
  const touch = stripInternal(current);

  let firstTouch = readRecord(env.storage, FIRST_TOUCH_KEY) || memoryFirstTouch;
  if (!firstTouch) {
    firstTouch = touch;
    writeRecord(env.storage, FIRST_TOUCH_KEY, firstTouch);
  }
  memoryFirstTouch = firstTouch;

  const lastTouch = readRecord(env.storage, LAST_TOUCH_KEY) || memoryLastTouch;
  if (!lastTouch || current.isNewTouch) {
    writeRecord(env.storage, LAST_TOUCH_KEY, touch);
    memoryLastTouch = touch;
  } else {
    memoryLastTouch = lastTouch;
  }

  return firstTouch;
}

export function getStoredTrafficSource(env = defaultEnv()) {
  return readRecord(env.storage, FIRST_TOUCH_KEY) || memoryFirstTouch || stripInternal(getTrafficSource(env));
}

export function getLastTouchTrafficSource(env = defaultEnv()) {
  return readRecord(env.storage, LAST_TOUCH_KEY) || memoryLastTouch;
}

export function clearTrafficSource(env = defaultEnv()) {
  memoryFirstTouch = null;
  memoryLastTouch = null;
  [FIRST_TOUCH_KEY, LAST_TOUCH_KEY].forEach((key) => {
    try {
      env.storage?.removeItem(key);
    } catch {
    }
  });
}


export function getTrafficPayload(env) {
  try {
    const record = getStoredTrafficSource(env);
    return {
      source: record.source,
      attributionType: record.attributionType,
      medium: record.medium ?? null,
      campaign: record.campaign ?? null,
      referrer: record.referrer ?? null,
      landingPage: record.landingPage,
      landingPath: record.landingPath,
      firstVisitAt: record.firstVisitAt,
    };
  } catch {
    return null;
  }
}
