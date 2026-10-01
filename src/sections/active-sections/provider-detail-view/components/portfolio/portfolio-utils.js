export const ACCENT = '#b79a73';
export const ACCENT_DARK = '#a3865f';
export const ACCENT_SOFT = '#fff3d8';

export const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'video/mp4'];
export const ALLOWED_FILE_TYPES_ATTR = ALLOWED_FILE_TYPES.join(',');
const ALLOWED_EXTENSIONS = { png: 'image', jpg: 'image', jpeg: 'image', jfif: 'image', gif: 'image', webp: 'image', mp4: 'video', pdf: 'pdf' };

export const EMPTY_FORM = { name: '', businessName: '', description: '', file: null };

export function getKindFromMime(type) {
  if (!type) return null;
  if (type.startsWith('image/')) return 'image';
  if (type === 'video/mp4') return 'video';
  if (type === 'application/pdf') return 'pdf';
  return 'other';
}

export function getKindFromUrl(url) {
  const ext = String(url || '').split('.').pop()?.toLowerCase();
  return ALLOWED_EXTENSIONS[ext] || 'other';
}

export function getFilenameFromUrl(url) {
  return String(url || '').split('/').pop() || 'file';
}

function mapMediaTypeToKind(mediaType) {
  if (mediaType === 'image') return 'image';
  if (mediaType === 'video') return 'video';
  if (mediaType === 'document') return 'pdf';
  return null;
}

export function resolveMediaDisplay(mediaItem) {
  if (!mediaItem) return null;

  const extKind = getKindFromUrl(mediaItem.url);
  const kind = extKind === 'image' || extKind === 'video' ? extKind : mapMediaTypeToKind(mediaItem.media_type) || extKind;

  const imageUrl = kind === 'image' ? mediaItem.url : mediaItem.thumbnail || null;
  return { kind, imageUrl, name: getFilenameFromUrl(mediaItem.url) };
}
