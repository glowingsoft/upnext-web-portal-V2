// core (MUI)
import { frFR as frFRCore, esES as esESCore, viVN as viVNCore, zhCN as zhCNCore, arSA as arSACore, ptBR as ptBRCore } from '@mui/material/locale';
// date pickers (MUI)
import { enUS as enUSDate, frFR as frFRDate, esES as esESDate, viVN as viVNDate, zhCN as zhCNDate, ptBR as ptBRDate } from '@mui/x-date-pickers/locales';
// data grid (MUI)
import {
  enUS as enUSDataGrid,
  frFR as frFRDataGrid,
  esES as esESDataGrid,
  viVN as viVNDataGrid,
  zhCN as zhCNDataGrid,
  arSD as arSDDataGrid,
  ptBR as ptBRDataGrid,
} from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    value: 'en',
    label: 'English',
    countryCode: 'GB',
    adapterLocale: 'en',
    numberFormat: { code: 'en-US', currency: 'USD' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components },
    },
  },
  {
    value: 'es',
    label: 'Spanish',
    countryCode: 'ES',
    adapterLocale: 'es',
    numberFormat: { code: 'es-ES', currency: 'USD' },
    systemValue: {
      components: { ...esESCore.components, ...esESDate.components, ...esESDataGrid.components },
    },
  },
  {
    value: 'fr',
    label: 'French',
    countryCode: 'FR',
    adapterLocale: 'fr',
    numberFormat: { code: 'fr-Fr', currency: 'USD' },
    systemValue: {
      components: { ...frFRCore.components, ...frFRDate.components, ...frFRDataGrid.components },
    },
  },
  {
    value: 'pt',
    label: 'Portuguese',
    countryCode: 'PT',
    adapterLocale: 'pt-br',
    numberFormat: { code: 'pt-BR', currency: 'USD' },
    systemValue: {
      components: { ...ptBRCore.components, ...ptBRDate.components, ...ptBRDataGrid.components },
    },
  },
  {
    value: 'cn',
    label: 'Mandarin',
    countryCode: 'CN',
    adapterLocale: 'zh-cn',
    numberFormat: { code: 'zh-CN', currency: 'USD' },
    systemValue: {
      components: { ...zhCNCore.components, ...zhCNDate.components, ...zhCNDataGrid.components },
    },
  },
  {
    value: 'ar',
    label: 'Arabic',
    countryCode: 'SA',
    adapterLocale: 'ar-sa',
    numberFormat: { code: 'ar', currency: 'USD' },
    systemValue: {
      components: { ...arSACore.components, ...arSDDataGrid.components },
    },
  },
  {
    value: 'ht',
    label: 'Haitian Creole',
    countryCode: 'HT',
    adapterLocale: 'ht',
    numberFormat: { code: 'fr-HT', currency: 'USD' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components },
    },
  },
];

/**
 * Country code:
 * https://flagcdn.com/en/codes.json
 *
 * Number format code:
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */
