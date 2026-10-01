import dayjs from 'dayjs';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { toast } from 'src/components/snackbar';
import { helpCenterApi } from 'src/store/Reducer/help-center-api';
import { settingsApi } from 'src/store/Reducer/settings-api';

import { allLangs } from './all-langs';
import { fallbackLng, changeLangMessages as messages } from './config-locales';

// ----------------------------------------------------------------------

/** Sidebar / nav labels live under `common.json`. */
export function useTranslateNav() {
  const { t } = useTranslation();

  return useCallback((key, options) => t(key, options), [t]);
}

// ----------------------------------------------------------------------

export function useTranslate(ns) {
  const { t, i18n } = useTranslation(ns);
  const dispatch = useDispatch();

  const fallback = allLangs.filter((lang) => lang.value === fallbackLng)[0];

  const currentLang = allLangs.find((lang) => lang.value === i18n.resolvedLanguage);

  const onChangeLang = useCallback(
    async (newLang) => {
      try {
        const langChangePromise = i18n.changeLanguage(newLang);

        const currentMessages = messages[newLang] || messages.en;

        toast.promise(langChangePromise, {
          loading: currentMessages.loading,
          success: () => currentMessages.success,
          error: currentMessages.error,
        });

        const targetLang = allLangs.find((lang) => lang.value === newLang);
        if (targetLang) {
          dayjs.locale(targetLang.adapterLocale);
        }
        
        await langChangePromise;
        dispatch(settingsApi.util.invalidateTags(['legalContent', 'faq']));
        dispatch(helpCenterApi.util.invalidateTags(['helpCenter']));
      } catch (error) {
        console.error(error);
      }
    },
    [i18n, dispatch]
  );

  return {
    t,
    i18n,
    onChangeLang,
    currentLang: currentLang ?? fallback,
  };
}
