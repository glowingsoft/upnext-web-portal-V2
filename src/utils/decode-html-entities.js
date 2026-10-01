const ENTITY_MAP = {
  '&amp;': '&',
  '&#38;': '&',
  '&#39;': "'",
  '&apos;': "'",
  '&quot;': '"',
  '&#34;': '"',
  '&lt;': '<',
  '&#60;': '<',
  '&gt;': '>',
  '&#62;': '>',
  '&nbsp;': ' ',
};

export function decodeHtmlEntities(value) {
  if (typeof value !== 'string' || !value.includes('&')) return value;
  return value.replace(/&#?\w+;/g, (entity) => ENTITY_MAP[entity] ?? entity);
}
