import { LoadingButton } from '@mui/lab';
import { Alert, Box, Stack, Tab, Tabs } from '@mui/material';
import Paper from '@mui/material/Paper';
import { styled, useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FlagIcon } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import { toast } from 'src/components/snackbar';
import { allLangs } from 'src/locales/all-langs';
import { useTranslate } from 'src/locales/use-locales';
import { useGetAdminLegalContentQuery, useCreateSettingsMutation, useUpdateSettingsMutation } from 'src/store/Reducer/settings-api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(3),
}));

const getInitialContentByLanguage = () => allLangs.reduce((acc, lang) => ({ ...acc, [lang.value]: '' }), {});
const RTL_LANGUAGES = ['ar'];
const LANG_TO_API_LANG = { cn: 'zh' };
const getApiLanguage = (language) => LANG_TO_API_LANG[language] || language;

// `type` (about/terms/policy, the prop this view is already called with) maps to both the
// API's URL segment and the field name on the shared settings document.
const TYPE_TO_API_TYPE = { about: 'about', terms: 'terms', policy: 'privacy' };
const TYPE_TO_FIELD_KEY = { about: 'about_us', terms: 'terms_and_conditions', policy: 'privacy_policy' };

/**
 * @param {Object} props
 * @param {string} props.type - Type of legal content (e.g., 'about', 'terms', 'privacy')
 */
export default function LegalView({ type }) {
  const theme = useTheme();
  const { t } = useTranslate();

  const [activeLanguage, setActiveLanguage] = useState('en');
  const [contentByLanguage, setContentByLanguage] = useState(getInitialContentByLanguage);
  const [error, setError] = useState('');

  const apiType = TYPE_TO_API_TYPE[type] || 'about';
  const fieldKey = TYPE_TO_FIELD_KEY[type] || 'about_us';

  const { data, isLoading, isFetching, refetch } = useGetAdminLegalContentQuery(apiType);
  const [createSettings, { isLoading: isCreating }] = useCreateSettingsMutation();
  const [updateSettings, { isLoading: isSavingUpdate }] = useUpdateSettingsMutation();
  const isUpdating = isCreating || isSavingUpdate;

  const settingsDoc = data?.data;
  const settingsId = settingsDoc?._id;
  const fieldContent = settingsDoc?.[fieldKey];

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ direction: 'rtl' }],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  const quillFormats = ['header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'direction', 'list', 'bullet', 'indent', 'align', 'link', 'image', 'video'];

  const legalTypeLabel = type === 'about' ? t('aboutUs') : type === 'terms' ? t('termsAndConditions') : type === 'policy' ? t('privacyPolicy') : '';
  const activeLangInfo = allLangs.find((lang) => lang.value === activeLanguage);
  const activeContent = contentByLanguage[activeLanguage] || '';
  const activeDirection = RTL_LANGUAGES.includes(activeLanguage) ? 'rtl' : 'ltr';

  /**
   * Handle current language content change
   * @param {string} value - New content value
   */
  const handleChangeContent = (value) => {
    setContentByLanguage((prev) => ({ ...prev, [activeLanguage]: value }));
    if (error) setError('');
  };

  /**
   * Validate content - checks if content is empty or only contains HTML tags
   * @param {string} content - HTML content to validate
   * @returns {boolean} - True if content is valid
   */
  const validateContent = (content) => {
    if (!content) return false;
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    return strippedContent.length > 0;
  };

  /**
   * Handle Save — each language tab is its own independent form. Save only ever touches the
   * language currently open, as a partial update — it never requires or resends the others, so
   * an admin can fill these in one language at a time, in any order, across separate sessions.
   */
  const handleSaveContent = async () => {
    if (!validateContent(activeContent)) {
      const errorMessage = t('enterLanguageContentRequired', { lang: activeLangInfo?.label || '' });
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    try {
      const payload = { [fieldKey]: { [getApiLanguage(activeLanguage)]: activeContent } };

      // About Us / Terms / Privacy all live on the SAME shared settings document — once it
      // exists (which it does after the very first save, for any of the three), we must
      // always update it, never create a second one. Re-fetch first if we don't already have
      // its id, so a stale/missing id can't cause us to wrongly call create.
      let currentSettingsId = settingsId;
      if (!currentSettingsId) {
        const freshResult = await refetch();
        currentSettingsId = freshResult?.data?.data?._id;
      }

      if (currentSettingsId) {
        await updateSettings({ id: currentSettingsId, ...payload }).unwrap();
      } else {
        await createSettings(payload).unwrap();
      }

      toast.success(t('contentUpdatedSuccessfully'));
      refetch();
    } catch (err) {
      const errorMessage = t('failedToUpdateContent', { type: legalTypeLabel });
      setError(errorMessage);
      toast.error(err?.data?.message || errorMessage);
    }
  };

  /**
   * Load data on component mount, type change, or once the API response arrives
   */
  useEffect(() => {
    let loaded;
    if (fieldContent && typeof fieldContent === 'object') {
      loaded = allLangs.reduce((acc, lang) => ({ ...acc, [lang.value]: fieldContent[getApiLanguage(lang.value)] ?? '' }), {});
    } else if (typeof fieldContent === 'string' && fieldContent.trim()) {
      // Legacy/seed document — a plain string instead of a per-language map. Show it under
      // English so the admin can see it and re-save it in the proper multi-language format.
      loaded = { ...getInitialContentByLanguage(), en: fieldContent };
    } else {
      loaded = getInitialContentByLanguage();
    }

    setContentByLanguage(loaded);

    // Clear errors when type changes
    setError('');
    setActiveLanguage('en');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, settingsDoc]);

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, display: 'flex', flexDirection: 'column' }}>
      {isLoading || isFetching ? (
        <LoadingScreen />
      ) : (
        <Stack spacing={4}>
          <Box>
            <StyledPaper
              elevation={3}
              sx={{
                pt: 0,
                '.ql-toolbar': {
                  backgroundColor: theme?.palette.mode === 'dark' ? '#fff' : '',
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  direction: 'ltr',
                  textAlign: 'left',
                },
                '.ql-container': {
                  minHeight: '300px',
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                },
                '.ql-editor': {
                  direction: activeDirection,
                  textAlign: activeDirection === 'rtl' ? 'right' : 'left',
                },
                // The placeholder is always plain English, not the tab's language — force it
                // to render LTR so trailing punctuation isn't bidi-reordered under an RTL tab.
                '.ql-editor.ql-blank::before': {
                  direction: 'ltr',
                  textAlign: 'left',
                },
              }}
            >
              <Tabs
                value={activeLanguage}
                onChange={(_, value) => {
                  setActiveLanguage(value);
                  setError('');
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
              >
                {allLangs.map((language) => (
                  <Tab
                    key={language.value}
                    value={language.value}
                    label={language.label}
                    icon={<FlagIcon code={language.countryCode} sx={{ width: 20, height: 20, borderRadius: '50%' }} />}
                    iconPosition="start"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                ))}
              </Tabs>
              <ReactQuill
                key={activeLanguage}
                value={activeContent}
                onChange={handleChangeContent}
                modules={quillModules}
                formats={quillFormats}
                placeholder={t('enterContentHere')}
                theme="snow"
              />
            </StyledPaper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <LoadingButton onClick={handleSaveContent} color="primary" variant="contained" loading={isUpdating} disabled={isUpdating}>
                {t('saveLanguageButton', { lang: activeLangInfo?.label || '' })}
              </LoadingButton>
            </Box>
          </Box>
        </Stack>
      )}
    </Box>
  );
}
