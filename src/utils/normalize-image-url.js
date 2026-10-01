
export function normalizeImageUrl(url) {
  if (!url) return '';
  if (/noimg|noimage/i.test(url)) return '';

  const match = url.match(/https?:\/\/.*?(https?:\/\/.+)$/);
  return match ? match[1] : url;
}
