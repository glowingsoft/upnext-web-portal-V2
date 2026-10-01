import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Field, Form } from 'src/components/hook-form';
import { FlagIcon, Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { varAlpha } from 'src/theme/styles';
import {
  useAddBadgeOptionMutation,
  useDeleteBadgeOptionMutation,
  useUpdateBadgeOptionMutation,
} from 'src/store/Reducer/badges-api';

// ----------------------------------------------------------------------

const SCOPE_OPTIONS = ['user', 'business', 'both'];

const LANG_COUNTRY = { en: 'GB', es: 'ES', fr: 'FR', pt: 'PT', zh: 'CN', ar: 'SA', ht: 'HT' };

const TRANSLATION_LANGS = [
  { key: 'es', label: 'Spanish (es)' },
  { key: 'fr', label: 'French (fr)' },
  { key: 'pt', label: 'Portuguese (pt)' },
  { key: 'zh', label: 'Chinese (zh)' },
  { key: 'ar', label: 'Arabic (ar)' },
  { key: 'ht', label: 'Haitian Creole (ht)' },
];

const RTL_LANGS = new Set(['ar']);
const getLanguageDirection = (key) => (RTL_LANGS.has(key) ? 'rtl' : 'ltr');

const EMPTY_OPTION = {
  name: '',
  translationEs: '',
  translationFr: '',
  translationPt: '',
  translationZh: '',
  translationAr: '',
  translationHt: '',
};

const optionSchema = zod.object({
  name: zod.string().trim().min(1, { message: 'Option name is required!' }),
  translationEs: zod.string().optional(),
  translationFr: zod.string().optional(),
  translationPt: zod.string().optional(),
  translationZh: zod.string().optional(),
  translationAr: zod.string().optional(),
  translationHt: zod.string().optional(),
});

const badgeSchema = zod.object({
  name: zod.string().trim().min(1, { message: 'Name (English) is required!' }),
  scope: zod.string().min(1, { message: 'Scope is required!' }),
  translationEs: zod.string().optional(),
  translationFr: zod.string().optional(),
  translationPt: zod.string().optional(),
  translationZh: zod.string().optional(),
  translationAr: zod.string().optional(),
  translationHt: zod.string().optional(),
  options: zod.array(optionSchema).optional(),
});

const DEFAULT_VALUES = {
  name: '',
  scope: 'both',
  translationEs: '',
  translationFr: '',
  translationPt: '',
  translationZh: '',
  translationAr: '',
  translationHt: '',
  options: [EMPTY_OPTION],
};

function buildTranslations(englishName, data) {
  return {
    en: englishName,
    es: data.translationEs || '',
    fr: data.translationFr || '',
    pt: data.translationPt || '',
    zh: data.translationZh || '',
    ar: data.translationAr || '',
    ht: data.translationHt || '',
  };
}

function optionToDraft(option) {
  const t = option.translations || {};
  return {
    name: t.en || option.name || '',
    translationEs: t.es || '',
    translationFr: t.fr || '',
    translationPt: t.pt || '',
    translationZh: t.zh || '',
    translationAr: t.ar || '',
    translationHt: t.ht || '',
  };
}

function FlagAdornment({ lang }) {
  return (
    <InputAdornment position="start">
      <FlagIcon code={LANG_COUNTRY[lang]} sx={{ width: 22, height: 16 }} />
    </InputAdornment>
  );
}

// ----------------------------------------------------------------------
// Existing badges can only have their options managed one at a time via
// dedicated endpoints (add/rename/delete) — there's no bulk "save options"
// call, so each action here persists immediately instead of waiting for the
// main dialog Save button.
function BadgeOptionsManager({ badge }) {
  const [options, setOptions] = useState(badge.options || []);
  const [drafts, setDrafts] = useState({});
  const [addOpen, setAddOpen] = useState(false);
  const [newOption, setNewOption] = useState(EMPTY_OPTION);

  const [addBadgeOption, { isLoading: isAdding }] = useAddBadgeOptionMutation();
  const [updateBadgeOption, { isLoading: isSavingOption }] = useUpdateBadgeOptionMutation();
  const [deleteBadgeOption, { isLoading: isDeleting }] = useDeleteBadgeOptionMutation();

  useEffect(() => {
    const nextOptions = badge.options || [];
    setOptions(nextOptions);
    setDrafts(Object.fromEntries(nextOptions.map((opt) => [opt._id || opt.id, optionToDraft(opt)])));
  }, [badge.options]);

  const badgeId = badge._id || badge.id;

  const isDirty = (option) => {
    const optionId = option._id || option.id;
    const original = optionToDraft(option);
    const draft = drafts[optionId] || original;
    return Object.keys(original).some((key) => original[key] !== draft[key]);
  };

  const handleDraftChange = (optionId, field, value) => {
    setDrafts((prev) => ({ ...prev, [optionId]: { ...prev[optionId], [field]: value } }));
  };

  const handleDiscard = (option) => {
    const optionId = option._id || option.id;
    setDrafts((prev) => ({ ...prev, [optionId]: optionToDraft(option) }));
  };

  const handleSave = async (option) => {
    const optionId = option._id || option.id;
    const draft = drafts[optionId];
    const name = draft.name.trim();
    if (!name) {
      toast.error('Option name is required.');
      return;
    }

    try {
      // The documented endpoint only takes `optionName`, but we also send the full
      // translations in case the backend accepts them — otherwise only the English
      // name will actually persist.
      await updateBadgeOption({
        id: badgeId,
        optionId,
        optionName: name,
        translations: buildTranslations(name, draft),
      }).unwrap();

      setOptions((prev) =>
        prev.map((opt) => ((opt._id || opt.id) === optionId ? { ...opt, name, translations: buildTranslations(name, draft) } : opt))
      );
      toast.success('Option updated successfully!');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update option.');
    }
  };

  const handleDelete = async (option) => {
    const optionId = option._id || option.id;
    try {
      await deleteBadgeOption({ id: badgeId, optionId }).unwrap();
      setOptions((prev) => prev.filter((opt) => (opt._id || opt.id) !== optionId));
      toast.success('Option deleted successfully!');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete option.');
    }
  };

  const handleAdd = async () => {
    const name = newOption.name.trim();
    if (!name) {
      toast.error('Option name is required.');
      return;
    }

    try {
      const result = await addBadgeOption({
        id: badgeId,
        option: { name, translations: buildTranslations(name, newOption) },
      }).unwrap();

      const created = result?.data?.options?.slice(-1)?.[0] || {
        _id: `local-${Date.now()}`,
        name,
        translations: buildTranslations(name, newOption),
      };

      setOptions((prev) => [...prev, created]);
      setNewOption(EMPTY_OPTION);
      setAddOpen(false);
      toast.success('Option added successfully!');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add option.');
    }
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">Options ({options.length})</Typography>
        <Button size="small" variant="outlined" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setAddOpen((v) => !v)}>
          Add Option
        </Button>
      </Stack>

      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Options are saved immediately as you add, rename, or remove them below.
      </Typography>

      {options.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.disabled' }}>
          No options yet.
        </Typography>
      )}

      <Stack spacing={1.5}>
        {options.map((option, index) => {
          const optionId = option._id || option.id;
          const draft = drafts[optionId] || optionToDraft(option);
          const dirty = isDirty(option);

          return (
            <Stack
              key={optionId}
              spacing={1.5}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: dirty ? 'primary.main' : 'divider',
                bgcolor: 'background.neutral',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  boxShadow: (theme) => `0 4px 14px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.08)}`,
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="overline" sx={{ color: 'text.disabled', fontSize: 10 }}>
                  Option {index + 1}
                </Typography>
                {dirty && (
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    • Unsaved changes
                  </Typography>
                )}
              </Stack>

              <TextField
                size="small"
                fullWidth
                label="Option Name (English)"
                value={draft.name}
                onChange={(e) => handleDraftChange(optionId, 'name', e.target.value)}
                InputProps={{ startAdornment: <FlagAdornment lang="en" /> }}
              />

              <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }} gap={1.5}>
                {TRANSLATION_LANGS.map(({ key, label }) => {
                  const field = `translation${key.charAt(0).toUpperCase()}${key.slice(1)}`;
                  const direction = getLanguageDirection(key);
                  return (
                    <TextField
                      key={key}
                      size="small"
                      label={label}
                      value={draft[field]}
                      onChange={(e) => handleDraftChange(optionId, field, e.target.value)}
                      InputProps={{ startAdornment: <FlagAdornment lang={key} /> }}
                      inputProps={{ dir: direction }}
                      sx={{ '& input': { textAlign: direction === 'rtl' ? 'right' : 'left' } }}
                    />
                  );
                })}
              </Box>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                {dirty && (
                  <Button size="small" color="inherit" onClick={() => handleDiscard(option)}>
                    Discard
                  </Button>
                )}
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<Iconify icon="solar:diskette-bold" width={16} />}
                  disabled={!dirty || isSavingOption}
                  onClick={() => handleSave(option)}
                >
                  Save
                </Button>
                <Tooltip title="Delete option">
                  <span>
                    <IconButton size="small" color="error" disabled={isDeleting} onClick={() => handleDelete(option)}>
                      <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          );
        })}
      </Stack>

      {addOpen && (
        <Stack
          spacing={1.5}
          sx={{ p: 2, borderRadius: 2, border: '1px dashed', borderColor: 'primary.main', bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04) }}
        >
          <Typography variant="overline" sx={{ color: 'primary.main', fontSize: 10 }}>
            New Option
          </Typography>

          <TextField
            size="small"
            label="Option Name (English)"
            value={newOption.name}
            onChange={(e) => setNewOption((prev) => ({ ...prev, name: e.target.value }))}
            InputProps={{ startAdornment: <FlagAdornment lang="en" /> }}
          />

          <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }} gap={1.5}>
            {TRANSLATION_LANGS.map(({ key, label }) => {
              const direction = getLanguageDirection(key);
              return (
                <TextField
                  key={key}
                  size="small"
                  label={label}
                  value={newOption[`translation${key.charAt(0).toUpperCase()}${key.slice(1)}`]}
                  onChange={(e) =>
                    setNewOption((prev) => ({
                      ...prev,
                      [`translation${key.charAt(0).toUpperCase()}${key.slice(1)}`]: e.target.value,
                    }))
                  }
                  InputProps={{ startAdornment: <FlagAdornment lang={key} /> }}
                  inputProps={{ dir: direction }}
                  sx={{ '& input': { textAlign: direction === 'rtl' ? 'right' : 'left' } }}
                />
              );
            })}
          </Box>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                setAddOpen(false);
                setNewOption(EMPTY_OPTION);
              }}
            >
              Cancel
            </Button>
            <LoadingButton size="small" variant="contained" color="primary" loading={isAdding} onClick={handleAdd}>
              Add
            </LoadingButton>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function BadgesFormDialog({ open, onClose, editData, onSubmit }) {
  const isEdit = Boolean(editData);

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(badgeSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { reset, handleSubmit, control, formState: { isSubmitting } } = methods;

  const { fields, append, remove } = useFieldArray({ control, name: 'options' });

  useEffect(() => {
    if (!open) return;

    if (editData) {
      const t = editData.translations || {};
      reset({
        name: t.en || editData.name || '',
        scope: editData.scope || 'both',
        translationEs: t.es || '',
        translationFr: t.fr || '',
        translationPt: t.pt || '',
        translationZh: t.zh || '',
        translationAr: t.ar || '',
        translationHt: t.ht || '',
        options: [],
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [open, editData, reset]);

  const handleFormSubmit = handleSubmit(async (data) => {
    if (isEdit) {
      await onSubmit({
        id: editData._id || editData.id,
        name: data.name,
        scope: data.scope,
        translations: buildTranslations(data.name, data),
      });
      return;
    }

    const validOptions = (data.options || []).filter((opt) => opt.name.trim());
    if (validOptions.length === 0) {
      toast.error('At least one option is required.');
      return;
    }

    await onSubmit({
      name: data.name,
      scope: data.scope,
      translations: buildTranslations(data.name, data),
      options: validOptions.map((opt) => ({
        name: opt.name,
        translations: buildTranslations(opt.name, opt),
      })),
    });
  });

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogTitle component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
          <Typography variant="h6">{isEdit ? 'Edit Badge' : 'Add Badge'}</Typography>
          <IconButton size="small" onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Field.Text name="name" label="Name (English)" placeholder="e.g. Accessibility & Inclusivity" InputProps={{ startAdornment: <FlagAdornment lang="en" /> }} />

            <Field.Select name="scope" label="Scope">
              {SCOPE_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </MenuItem>
              ))}
            </Field.Select>

            <Divider>
              <Typography variant="overline" sx={{ color: 'text.secondary', px: 1 }}>
                Translations
              </Typography>
            </Divider>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }} gap={2}>
              {TRANSLATION_LANGS.map(({ key, label }) => {
                const direction = getLanguageDirection(key);
                return (
                  <Field.Text
                    key={key}
                    name={`translation${key.charAt(0).toUpperCase()}${key.slice(1)}`}
                    label={label}
                    placeholder={`Translation in ${label.split(' ')[0]}`}
                    InputProps={{ startAdornment: <FlagAdornment lang={key} /> }}
                    inputProps={{ dir: direction }}
                    sx={{ '& input': { textAlign: direction === 'rtl' ? 'right' : 'left' } }}
                  />
                );
              })}
            </Box>

            <Divider>
              <Typography variant="overline" sx={{ color: 'text.secondary', px: 1 }}>
                Options
              </Typography>
            </Divider>

            {isEdit ? (
              <BadgeOptionsManager badge={editData} />
            ) : (
              <Stack spacing={1.5}>
                {fields.map((field, index) => (
                  <Stack
                    key={field.id}
                    spacing={1.5}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.2),
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Typography variant="overline" sx={{ color: 'text.disabled', fontSize: 10 }}>
                        Option {index + 1}
                      </Typography>
                      <Tooltip title="Remove option">
                        <span>
                          <IconButton size="small" color="error" disabled={fields.length === 1} onClick={() => remove(index)}>
                            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>

                    <Field.Text
                      name={`options[${index}].name`}
                      label="Option Name (English)"
                      size="small"
                      InputProps={{ startAdornment: <FlagAdornment lang="en" /> }}
                    />

                    <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }} gap={1.5}>
                      {TRANSLATION_LANGS.map(({ key, label }) => {
                        const direction = getLanguageDirection(key);
                        return (
                          <Field.Text
                            key={key}
                            name={`options[${index}].translation${key.charAt(0).toUpperCase()}${key.slice(1)}`}
                            label={label}
                            size="small"
                            InputProps={{ startAdornment: <FlagAdornment lang={key} /> }}
                            inputProps={{ dir: direction }}
                            sx={{ '& input': { textAlign: direction === 'rtl' ? 'right' : 'left' } }}
                          />
                        );
                      })}
                    </Box>
                  </Stack>
                ))}

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={() => append(EMPTY_OPTION)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Option
                </Button>
              </Stack>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
            {isEdit ? 'Update Badge' : 'Add Badge'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
