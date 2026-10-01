import { useEffect, useRef, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { useDebounce } from 'src/hooks/use-debounce';
import { useTranslate } from 'src/locales/use-locales';
import {
  useCreateServiceCategoryMutation,
  useGetServiceCategoriesQuery,
  useLazyGetServiceCategoriesQuery,
  useSuggestServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
} from 'src/store/Reducer/services-api';

const filter = createFilterOptions();
export function ServiceCategoryField({ name = 'category', label, serviceName = '', serviceDescription = '' }) {
  const { t } = useTranslate();
  const { control, setValue } = useFormContext();
  const { field, fieldState: { error } } = useController({ name, control });

  const [inputValue, setInputValue] = useState('');
  const [createdOptions, setCreatedOptions] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editState, setEditState] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [aiResult, setAiResult] = useState(null);
  const debouncedSearch = useDebounce(inputValue, 300);

  const { data, isFetching } = useGetServiceCategoriesQuery({ limit: 100, keyword: debouncedSearch || undefined });
  const [createServiceCategory] = useCreateServiceCategoryMutation();
  const [updateServiceCategory, { isLoading: isUpdating }] = useUpdateServiceCategoryMutation();
  const [suggestServiceCategory, { isLoading: isSuggesting }] = useSuggestServiceCategoryMutation();
  const [triggerGetCategories] = useLazyGetServiceCategoriesQuery();

  const readyForAi = Boolean(serviceName.trim() && serviceDescription.trim());

  useEffect(() => {
    setAiResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceName, serviceDescription, field.value, inputValue]);

  const serverOptions = data?.data?.docs || data?.data?.data || (Array.isArray(data?.data) ? data.data : []);

  const options = [
    ...createdOptions,
    ...serverOptions.filter((option) => !createdOptions.some((created) => created._id === option._id)),
  ];

  const selectedOption = options.find((option) => option._id === field.value) || null;


  const syncedIdRef = useRef(null);
  useEffect(() => {
    if (field.value && field.value !== syncedIdRef.current && selectedOption) {
      setInputValue(selectedOption.name || '');
      syncedIdRef.current = field.value;
    } else if (!field.value) {
      syncedIdRef.current = null;
    }
  }, [field.value, selectedOption]);

  const handleOpenEdit = (event, option) => {
    event.stopPropagation();
    setEditState({ option });
    setEditName(option.name || '');
    setEditStatus(option.status || 'active');
  };

  const handleCloseEdit = () => setEditState(null);

  const handleSaveEdit = async () => {
    if (!editState) return;
    const { option } = editState;
    const trimmed = editName.trim();
    if (!trimmed) return;

    try {
      await updateServiceCategory({ id: option._id, name: trimmed, status: editStatus }).unwrap();
      setCreatedOptions((prev) => prev.map((o) => (o._id === option._id ? { ...o, name: trimmed, status: editStatus } : o)));
      if (field.value === option._id) setInputValue(trimmed);
      toast.success(t('updateSuccess', { defaultValue: 'Category updated' }));
      setEditState(null);
    } catch (submitError) {
      toast.error(submitError?.data?.message || t('somethingWentWrong'));
    }
  };

  const handleAskAi = async () => {
    try {
      const payload = { name: serviceName.trim(), description: serviceDescription.trim() };
      if (field.value) payload.selectedCategoryId = field.value;
      const response = await suggestServiceCategory(payload).unwrap();
      setAiResult(response?.data || null);
    } catch (submitError) {
      toast.error(submitError?.data?.message || t('somethingWentWrong'));
    }
  };
  const suggestion = aiResult
    ? aiResult.suggestedCategoryName
      ? { name: aiResult.suggestedCategoryName, id: null, description: aiResult.suggestedCategoryDescription || '' }
      : { name: aiResult.categoryName, id: aiResult.categoryId, description: '' }
    : null;

  const handleApplySuggestion = async () => {
    if (!suggestion?.name) return;

    if (suggestion.id) {
      if (!options.some((option) => option._id === suggestion.id)) {
        setCreatedOptions((prev) => [{ _id: suggestion.id, name: suggestion.name }, ...prev]);
      }
      setValue(name, suggestion.id, { shouldValidate: true });
      setInputValue(suggestion.name);
      setAiResult(null);
      return;
    }

    setIsCreating(true);
    try {
      const lookup = await triggerGetCategories({ keyword: suggestion.name, limit: 100 }).unwrap();
      const lookupOptions = lookup?.data?.docs || lookup?.data?.data || (Array.isArray(lookup?.data) ? lookup.data : []);
      const existing = lookupOptions.find((option) => option.name?.toLowerCase() === suggestion.name.toLowerCase());

      if (existing) {
        setCreatedOptions((prev) => (prev.some((o) => o._id === existing._id) ? prev : [existing, ...prev]));
        setValue(name, existing._id, { shouldValidate: true });
        setInputValue(existing.name);
        setAiResult(null);
        return;
      }

      const response = await createServiceCategory({ name: suggestion.name, description: suggestion.description }).unwrap();
      const created = response?.data || response;
      if (created?._id) {
        setCreatedOptions((prev) => [created, ...prev]);
        setValue(name, created._id, { shouldValidate: true });
        setInputValue(created.name);
      }
      setAiResult(null);
    } catch (submitError) {
      toast.error(submitError?.data?.message || t('somethingWentWrong'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box>
      <Autocomplete
        value={selectedOption}
        onChange={async (event, newValue) => {
          if (newValue && !newValue.isNew && newValue.status === 'inactive') return;

          if (newValue && newValue.isNew) {
            setIsCreating(true);
            try {
              const response = await createServiceCategory(newValue.inputValue).unwrap();
              const created = response?.data || response;
              if (created?._id) {
                setCreatedOptions((prev) => [created, ...prev]);
                setValue(name, created._id, { shouldValidate: true });
              }
            } catch (submitError) {
              toast.error(submitError?.data?.message || t('somethingWentWrong'));
            } finally {
              setIsCreating(false);
            }
            return;
          }

          setValue(name, newValue?._id || '', { shouldValidate: true });
        }}
        inputValue={inputValue}
        onInputChange={(event, value, reason) => {
          if (reason !== 'reset') setInputValue(value);
        }}
        options={options}
        filterOptions={(currentOptions, params) => {
          const filtered = filter(currentOptions, params);
          const { inputValue: typed } = params;
          const alreadyExists = currentOptions.some((option) => option.name?.toLowerCase() === typed.toLowerCase());

          if (typed !== '' && !alreadyExists) {
            filtered.push({ inputValue: typed, isNew: true, name: typed });
          }

          return filtered;
        }}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          if (option?.isNew) return option.inputValue;
          return option?.name || '';
        }}
        renderOption={(optionProps, option) => {
          const { key, ...rest } = optionProps;
          if (option.isNew) {
            return (
              <Box
                component="li"
                key={key}
                {...rest}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}
              >
                <Iconify icon="mingcute:add-circle-fill" width={18} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit' }}>
                  {t('addNewValue', { value: option.inputValue, defaultValue: `Add "${option.inputValue}"` })}
                </Typography>
              </Box>
            );
          }
          return (
            <Box
              component="li"
              key={key}
              {...rest}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                ...(option.status === 'inactive' && {
                  cursor: 'default',
                  '&:hover, &.Mui-focused': { backgroundColor: 'transparent !important' },
                }),
              }}
            >
              <Box
                component="span"
                sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.75, overflow: 'hidden' }}
                {...(option.status === 'inactive' && {
                  onClick: (event) => event.stopPropagation(),
                  onMouseDown: (event) => event.stopPropagation(),
                })}
              >
                <Box
                  component="span"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: option.status === 'inactive' ? 'text.disabled' : 'inherit',
                  }}
                >
                  {option.name}
                </Box>
                {option.status === 'inactive' && (
                  <Label variant="soft" color="default" sx={{ height: 18, fontSize: 10, px: 0.75, flexShrink: 0 }}>
                    {t('inactive')}
                  </Label>
                )}
              </Box>
              <IconButton
                size="small"
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => handleOpenEdit(event, option)}
              >
                <Iconify icon="solar:pen-bold" width={16} />
              </IconButton>
            </Box>
          );
        }}
        isOptionEqualToValue={(option, value) => option._id === value._id}
        loading={isFetching || isCreating}
        disabled={!readyForAi}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label ?? t('serviceCategory')}
            error={!!error}
            helperText={
              error?.message ||
              (readyForAi ? t('serviceCategoryHint') : t('serviceCategoryLockedHint', { defaultValue: 'Enter a service name and description first' }))
            }
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {(isFetching || isCreating) && <CircularProgress size={16} sx={{ mr: 0.5 }} />}
                  {readyForAi && (
                    <Tooltip
                      title={
                        field.value
                          ? t('checkAiCompatibility', { defaultValue: 'Check AI Compatibility' })
                          : t('askAiSuggestCategory', { defaultValue: 'Ask AI to Suggest Category' })
                      }
                    >
                      <span>
                        <IconButton
                          size="small"
                          disabled={isSuggesting}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAskAi();
                          }}
                          sx={{ color: 'primary.main' }}
                        >
                          {isSuggesting ? <CircularProgress size={16} /> : <Iconify icon="mingcute:ai-fill" width={19} />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {readyForAi && aiResult && (
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          <Alert
            severity={!field.value ? 'info' : aiResult.categoryMismatch ? 'warning' : 'success'}
            action={
              suggestion?.name && (!field.value || aiResult.categoryMismatch) ? (
                <Button color="inherit" size="small" disabled={isCreating} onClick={handleApplySuggestion}>
                  {t('useThisCategory', { defaultValue: 'Use This' })}
                </Button>
              ) : undefined
            }
          >
            {!field.value
              ? t('aiSuggestsCategory', { value: suggestion?.name, defaultValue: `AI suggests: ${suggestion?.name}` })
              : aiResult.categoryMismatch
                ? t('aiMismatch', {
                    value: suggestion?.name,
                    defaultValue: `This may not be the best category. AI suggests "${suggestion?.name}" instead.`,
                  })
                : t('aiGoodMatch', { defaultValue: 'Great fit! This category matches the service well.' })}
          </Alert>
        </Stack>
      )}

      <Dialog fullWidth maxWidth="xs" open={Boolean(editState)} onClose={handleCloseEdit}>
        <DialogTitle>{t('editCategory', { defaultValue: 'Edit Category' })}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              label={t('name')}
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
            />
            <TextField select label={t('status')} value={editStatus} onChange={(event) => setEditStatus(event.target.value)}>
              <MenuItem value="active">{t('active')}</MenuItem>
              <MenuItem value="inactive">{t('inactive')}</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleCloseEdit}>
            {t('cancel')}
          </Button>
          <LoadingButton
            variant="contained"
            color="primary"
            loading={isUpdating}
            disabled={!editName.trim()}
            onClick={handleSaveEdit}
          >
            {t('update')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
