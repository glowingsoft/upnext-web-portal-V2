export const fallbackLng = 'en';
export const languages = ['en', 'es', 'fr', 'pt', 'cn', 'ar', 'ht'];
export const defaultNS = 'common';
export const cookieName = 'i18next';

// ----------------------------------------------------------------------

export function i18nOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    lng,
    fallbackLng,
    ns,
    defaultNS,
    fallbackNS: defaultNS,
    supportedLngs: languages,
    interpolation: { escapeValue: false },
  };
}

// ----------------------------------------------------------------------

export const changeLangMessages = {
  en: {
    success: 'Language has been changed!',
    error: 'Error changing language!',
    loading: 'Loading...',
  },
  es: {
    success: '¡El idioma ha sido cambiado!',
    error: '¡Error al cambiar el idioma!',
    loading: 'Cargando...',
  },
  fr: {
    success: 'La langue a été changée!',
    error: 'Erreur lors du changement de langue!',
    loading: 'Chargement...',
  },
  pt: {
    success: 'O idioma foi alterado!',
    error: 'Erro ao alterar o idioma!',
    loading: 'Carregando...',
  },
  cn: {
    success: '语言已更改！',
    error: '更改语言时出错！',
    loading: '加载中...',
  },
  ar: {
    success: 'تم تغيير اللغة!',
    error: 'خطأ في تغيير اللغة!',
    loading: 'جارٍ التحميل...',
  },
  ht: {
    success: 'Lang lan chanje!',
    error: 'Erè pandan chanjman lang lan!',
    loading: 'Ap chaje...',
  },
};
