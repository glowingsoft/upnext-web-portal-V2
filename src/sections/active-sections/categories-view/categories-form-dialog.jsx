import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
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
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ColorPicker } from 'src/components/color-utils';
import { Field, Form } from 'src/components/hook-form';
import { FlagIcon, Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';
import { useUploadS3Mutation } from 'src/store/Reducer/auth';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['active', 'inactive'];
const SCOPE_OPTIONS = ['user', 'business', 'both'];

const LANG_COUNTRY = { en: 'GB', es: 'ES', fr: 'FR', pt: 'PT', zh: 'CN', ar: 'SA', ht: 'HT' };

function FlagAdornment({ lang }) {
  return (
    <InputAdornment position="start">
      <FlagIcon code={LANG_COUNTRY[lang]} sx={{ width: 22, height: 16 }} />
    </InputAdornment>
  );
}

const COLOR_OPTIONS = [
  '#FF6B6B', '#FF7043', '#FFA726', '#FFCA28',
  '#D4E157', '#66BB6A', '#26A69A', '#29B6F6',
  '#42A5F5', '#2563EB', '#5C6BC0', '#7E57C2',
  '#EC407A', '#AB47BC', '#8D6E63', '#78909C',
  '#E8763A', '#E53935', '#00897B', '#1E88E5',
];

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

const categorySchema = zod.object({
  icon: zod.any().nullable().optional(),
  name: zod.string().trim().min(1, { message: 'Name (English) is required!' }),
  color: zod.string().trim().optional(),
  sortOrder: zod.union([zod.string(), zod.number()]).optional(),
  scope: zod.string().min(1, { message: 'Scope is required!' }),
  status: zod.string().min(1, { message: 'Status is required!' }),
  translationEs: zod.string().optional(),
  translationFr: zod.string().optional(),
  translationPt: zod.string().optional(),
  translationZh: zod.string().optional(),
  translationAr: zod.string().optional(),
  translationHt: zod.string().optional(),
});

const DEFAULT_VALUES = {
  icon: null,
  name: '',
  color: '#000000',
  sortOrder: '',
  scope: 'both',
  status: 'active',
  translationEs: '',
  translationFr: '',
  translationPt: '',
  translationZh: '',
  translationAr: '',
  translationHt: '',
};

// ----------------------------------------------------------------------

export function CategoriesFormDialog({ open, onClose, editData, onSubmit }) {
  const isEdit = Boolean(editData);

  const [uploadS3] = useUploadS3Mutation();

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(categorySchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { reset, handleSubmit, control, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (!open) return;

    if (editData) {
      const t = editData.translations || {};
      const hasRealIcon = editData.icon && !editData.icon.toLowerCase().includes('noimg');
      reset({
        icon: hasRealIcon ? editData.icon : null,
        name: t.en || editData.name || '',
        color: editData.color || '#000000',
        sortOrder: editData.sortOrder ?? '',
        scope: editData.scope || 'both',
        status: editData.status || 'active',
        translationEs: t.es || '',
        translationFr: t.fr || '',
        translationPt: t.pt || '',
        translationZh: t.zh || '',
        translationAr: t.ar || '',
        translationHt: t.ht || '',
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [open, editData, reset]);

  const handleFormSubmit = handleSubmit(async (data) => {
    let iconUrl = typeof data.icon === 'string' ? data.icon : null;

    if (data.icon instanceof File) {
      const formData = new FormData();
      formData.append('files', data.icon);
      const res = await uploadS3(formData).unwrap();
      iconUrl = res?.data?.file || null;
    }

    await onSubmit({
      name: data.name,
      translations: {
        en: data.name,
        es: data.translationEs || '',
        fr: data.translationFr || '',
        pt: data.translationPt || '',
        zh: data.translationZh || '',
        ar: data.translationAr || '',
        ht: data.translationHt || '',
      },
      ...(iconUrl && { icon: iconUrl }),
      color: data.color || '',
      sortOrder: data.sortOrder !== '' ? Number(data.sortOrder) : undefined,
      scope: data.scope,
      status: data.status,
    });
  });

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogTitle
          component="div"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}
        >
          <Typography variant="h6">{isEdit ? 'Edit Category' : 'Add Category'}</Typography>
          <IconButton size="small" onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* Icon image upload */}
            <Stack alignItems="center">
              <Field.UploadAvatar
                name="icon"
                maxSize={3145728}
                placeholderContent={
                  <Stack alignItems="center" spacing={0.75}>
                    <Iconify icon="solar:gallery-add-bold" width={32} />
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      Upload Icon
                    </Typography>
                  </Stack>
                }
                placeholderSx={{
                  color: 'primary.main',
                  bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                }}
                sx={{
                  border: (theme) => `1px dashed ${varAlpha(theme.vars.palette.primary.mainChannel, 0.32)}`,
                  bgcolor: 'grey.400',
                }}
                helperText={
                  <Typography variant="caption" sx={{ mt: 1, mx: 'auto', display: 'block', textAlign: 'center', color: 'text.disabled' }}>
                    *.jpeg, *.jpg, *.png, *.gif — max 3 MB
                  </Typography>
                }
              />
            </Stack>

            <Field.Text
              name="name"
              label="Name (English)"
              placeholder="e.g. Waxing Specialist"
              InputProps={{ startAdornment: <FlagAdornment lang="en" /> }}
            />

            <Box display="grid" gridTemplateColumns="1fr" gap={2}>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      Color
                    </Typography>
                    <ColorPicker
                      colors={COLOR_OPTIONS}
                      selected={field.value || ''}
                      onSelectColor={field.onChange}
                      sx={{ gap: 0 }}
                    />
                    <OutlinedInput
                      value={field.value || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                          field.onChange(val);
                        }
                      }}
                      placeholder="#000000"
                      size="small"
                      inputProps={{ maxLength: 7, style: { fontFamily: 'monospace' } }}
                      startAdornment={
                        <InputAdornment position="start">
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '4px',
                              bgcolor: /^#[0-9A-Fa-f]{6}$/.test(field.value) ? field.value : 'transparent',
                              border: '1px solid',
                              borderColor: 'divider',
                              flexShrink: 0,
                            }}
                          />
                        </InputAdornment>
                      }
                    />
                  </Stack>
                )}
              />
            </Box>

            <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
              <Field.Text name="sortOrder" label="Sort Order" type="number" placeholder="e.g. 10" />

              <Field.Select name="scope" label="Scope">
                {SCOPE_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Select name="status" label="Status">
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </MenuItem>
                ))}
              </Field.Select>
            </Box>

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
                    name={`translation${key.charAt(0).toUpperCase() + key.slice(1)}`}
                    label={label}
                    placeholder={`Translation in ${label.split(' ')[0]}`}
                    InputProps={{ startAdornment: <FlagAdornment lang={key} /> }}
                    inputProps={{ dir: direction }}
                    sx={{ '& input': { textAlign: direction === 'rtl' ? 'right' : 'left' } }}
                  />
                );
              })}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
            {isEdit ? 'Update Category' : 'Add Category'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
