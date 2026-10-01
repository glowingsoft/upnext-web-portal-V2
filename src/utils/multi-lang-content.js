export const getApiLanguage = (language = 'en') => {
  const LANG_TO_API_LANG = { cn: 'zh' };
  return LANG_TO_API_LANG[language] || language;
};

// Some settings documents (legacy/seed data created directly in the DB, before the
// multi-language map format existed) store a field as a plain string instead of the
// expected `{ en, es, fr, ... }` map. Handle both shapes gracefully.
export const getMultiLangValue = (fieldValue, lang, fallbackLang = 'en') => {
  if (!fieldValue) return '';
  if (typeof fieldValue === 'string') return fieldValue;
  return fieldValue[lang] || fieldValue[fallbackLang] || '';
};
