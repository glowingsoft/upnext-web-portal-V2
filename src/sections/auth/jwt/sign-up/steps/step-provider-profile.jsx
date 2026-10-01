import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useWatch, useFormContext } from 'react-hook-form';
import { Field } from 'src/components/hook-form';
import { fData } from 'src/utils/format-number';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useGetBadgesQuery } from 'src/store/Reducer/badges-api';
import { useSuggestBusinessDescriptionMutation } from 'src/store/Reducer/auth';
import { TagsMultiSelect } from 'src/sections/active-sections/provider-detail-view/components/tags-multi-select';
import { BadgeSelect } from '../components/badge-select';
import { CategoriesMultiSelect } from '../components/categories-multi-select';

const CERTIFICATION_BADGE_NAME = 'Certifications & Licensing';

const MAX_SKILLS = 10;

function normalizeSkills(value) {
  const seen = new Set();

  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_SKILLS);
}

export function SkillsField() {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name="skills"
      control={control}
      render={({ field, fieldState: { error } }) => {
        const selected = Array.isArray(field.value) ? field.value : [];
        const hasReachedLimit = selected.length >= MAX_SKILLS;

        return (
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={selected}
            filterSelectedOptions
            onChange={(_, newValue) => {
              setValue('skills', normalizeSkills(newValue), { shouldValidate: true, shouldDirty: true });
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });

                return <Chip key={key} {...tagProps} label={option} size="small" color="primary" variant="soft" />;
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Skills"
                placeholder={hasReachedLimit ? '' : '+ Skills'}
                error={!!error}
                helperText={error?.message}
                inputProps={{
                  ...params.inputProps,
                  onKeyDown: (event) => {
                    if (hasReachedLimit && event.key === 'Enter') {
                      event.preventDefault();
                    }
                    params.inputProps.onKeyDown?.(event);
                  },
                }}
              />
            )}
          />
        );
      }}
    />
  );
}

export function CertificationUploadField() {
  const { setValue, formState: { errors } } = useFormContext();
  const certificationFile = useWatch({ name: 'certificationFile' });
  const hasFile = !!certificationFile;
  const [fileUrl, setFileUrl] = useState('');
  const errorMessage = errors.certificationFile?.message;

  const fileName = typeof certificationFile === 'string' ? certificationFile.split('/').pop() : certificationFile?.name || 'Uploaded file';

  const fileType = useMemo(() => {
    if (!certificationFile) return '';
    if (typeof certificationFile === 'string') {
      const extension = certificationFile.split('.').pop();
      return extension ? `${extension}` : 'file';
    }
    return certificationFile.type || 'file';
  }, [certificationFile]);

  useEffect(() => {
    if (!certificationFile) {
      setFileUrl('');
      return;
    }

    if (typeof certificationFile === 'string') {
      setFileUrl(certificationFile);
      return;
    }

    const objectUrl = URL.createObjectURL(certificationFile);
    setFileUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [certificationFile]);

  const handleUpload = (event) => {
    const file = event.target.files?.[0] || null;
    setValue('certificationFile', file, { shouldValidate: true });
    event.target.value = '';
  };

  const handleRemove = () => {
    setValue('certificationFile', null, { shouldValidate: true });
  };

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">Upload License Image</Typography>

        <Button
          component="label"
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="solar:upload-bold" width={16} />}
          sx={{ color: '#7b5a32', borderColor: 'rgba(123, 90, 50, 0.35)' }}
        >
          Upload
          <Box component="input" type="file" hidden onChange={handleUpload} />
        </Button>
      </Stack>

      {hasFile ? (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.25}
          sx={{
            p: 1.25,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f3ede3',
                color: '#7b5a32',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:file-text-bold" width={18} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: '#7b5a32' }} title={fileName}>
                {fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {fileType}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.25}>
            <IconButton component="a" href={fileUrl || undefined} target="_blank" rel="noopener noreferrer" size="small" disabled={!fileUrl} sx={{ color: '#7b5a32' }}>
              <Iconify icon="eva:external-link-fill" width={16} />
            </IconButton>
            <IconButton size="small" onClick={handleRemove} sx={{ color: '#b66a2c' }}>
              <Iconify icon="solar:trash-bin-trash-bold" width={16} />
            </IconButton>
          </Stack>
        </Stack>
      ) : (
        <Box
          sx={{
            p: 1.25,
            borderRadius: 1.5,
            border: '1px dashed',
            borderColor: errorMessage ? 'error.main' : 'divider',
            color: 'text.secondary',
            typography: 'body2',
          }}
        >
          No uploaded files attached.
        </Box>
      )}

      {errorMessage && (
        <Typography variant="caption" sx={{ color: 'error.main', px: 0.5 }}>
          {errorMessage}
        </Typography>
      )}
    </Stack>
  );
}

export function StepProviderProfile({ step }) {
  const { control, setValue } = useFormContext();
  const selectedCertification = useWatch({ control, name: 'certifications' });
  const businessType = useWatch({ control, name: 'businessType' });
  const selectedCategories = useWatch({ control, name: 'categories' }) || [];
  const selectedCategoryIds = selectedCategories.map((cat) => cat?._id || cat).filter(Boolean);
  const selectedCategoryNames = selectedCategories.map((cat) => cat?.name).filter(Boolean);
  const selectedTags = useWatch({ control, name: 'tags' }) || [];
  const selectedTagNames = selectedTags.map((tag) => tag?.name).filter(Boolean);
  const businessNameValue = useWatch({ control, name: 'businessName' }) || '';
  const descriptionValue = useWatch({ control, name: 'description' }) || '';
  const skillsValue = useWatch({ control, name: 'skills' }) || [];
  const { data: badgesData, isLoading: badgesLoading } = useGetBadgesQuery({ scope: 'business' });
  const certificationBadge = (badgesData?.data || []).find(
    (b) => (b?.translations?.en || b?.name || '') === CERTIFICATION_BADGE_NAME
  );

  const [suggestBusinessDescription, { isLoading: isSuggestingDescription }] = useSuggestBusinessDescriptionMutation();
  const [descriptionSuggestion, setDescriptionSuggestion] = useState(null);

  const readyForDescriptionAi = Boolean(businessNameValue.trim() && selectedCategoryNames.length > 0);

  useEffect(() => {
    setDescriptionSuggestion(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessNameValue, selectedCategoryNames.join(','), selectedTagNames.join(','), skillsValue.join(','), descriptionValue]);

  const handleSuggestDescription = async () => {
    try {
      const payload = {
        businessName: businessNameValue.trim(),
        categories: selectedCategoryNames,
        skills: skillsValue,
        ...(selectedTagNames.length ? { tags: selectedTagNames } : {}),
      };
      const response = await suggestBusinessDescription(payload).unwrap();
      setDescriptionSuggestion(response?.data?.description || null);
    } catch (submitError) {
      toast.error(submitError?.data?.message || 'Something went wrong');
    }
  };

  const handleApplyDescriptionSuggestion = () => {
    if (!descriptionSuggestion) return;
    setValue('description', descriptionSuggestion, { shouldValidate: true, shouldDirty: true });
    setDescriptionSuggestion(null);
  };

  if (step === 1) {
    return (
      <Stack spacing={3}>
        <Field.AddressAutocomplete
          name="location"
          label="Location"
          placeholder="Enter business location"
          onPlaceSelected={({ lat, lng }) => {
            setValue('locationLat', lat, { shouldDirty: true });
            setValue('locationLng', lng, { shouldDirty: true });
          }}
        />

        <CategoriesMultiSelect name="categories" label="Category" scope="business" />

        <TagsMultiSelect name="tags" label="Tags" categoryIds={selectedCategoryIds} />

        {badgesLoading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 2 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : (
          <BadgeSelect fieldName="certifications" badge={certificationBadge} />
        )}

        {selectedCertification ? (
          <Stack spacing={1}>
            <CertificationUploadField />
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Allowed any file type, max size of {fData(3145728)}
            </Typography>
          </Stack>
        ) : null}

        <SkillsField />

        <Box>
          <Field.Text
            name="description"
            label="Description"
            placeholder="Describe your business in a few words"
            multiline
            minRows={3}
            maxRows={6}
            inputProps={{ maxLength: 1000 }}
            helperText={`${descriptionValue.length} / 1000`}
            InputProps={{
              endAdornment: readyForDescriptionAi ? (
                <Tooltip title="Ask AI to Suggest Description">
                  <span>
                    <IconButton
                      size="small"
                      disabled={isSuggestingDescription}
                      onClick={handleSuggestDescription}
                      sx={{ color: 'primary.main', alignSelf: 'flex-start' }}
                    >
                      {isSuggestingDescription ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Iconify icon="mingcute:ai-fill" width={19} />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              ) : undefined,
            }}
          />

          {!readyForDescriptionAi && (
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
              Enter a business name and select a category to enable AI suggestions
            </Typography>
          )}

          {descriptionSuggestion && (
            <Alert
              severity="info"
              sx={{ mt: 1.5 }}
              action={
                <Button color="inherit" size="small" onClick={handleApplyDescriptionSuggestion}>
                  Use This
                </Button>
              }
            >
              {descriptionSuggestion}
            </Alert>
          )}
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Business Image */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
        {/* Business Cover Image */}
        <Stack spacing={1.5} sx={{ flex: 1, width: '100%' }}>
          <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>
            Business Cover Photo
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Field.UploadAvatar
              name="businessCoverImage"
              maxSize={3145728}
              helperText={
                <Typography variant="caption" sx={{ mt: 3, display: 'block', textAlign: 'center', color: 'text.disabled' }}>
                  Upload your cover photo
                  <br />
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br />
                  max size of {fData(3145728)}
                </Typography>
              }
            />
          </Box>
        </Stack>
        <Stack spacing={1.5} sx={{ flex: 1, width: '100%' }}>
          <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>
            Business Image
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Field.UploadAvatar
              name="businessImage"
              maxSize={3145728}
              helperText={
                <Typography variant="caption" sx={{ mt: 3, display: 'block', textAlign: 'center', color: 'text.disabled' }}>
                  Upload your business image
                  <br />
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br />
                  max size of {fData(3145728)}
                </Typography>
              }
            />
          </Box>
        </Stack>
      </Stack>

      {/* Business Name */}
      <Field.Text name="businessName" label="Business Name" placeholder="Enter business name" InputLabelProps={{ shrink: true }} />

      <Field.Select name="businessType" label="Business Type">
        <MenuItem value="solo">Solo</MenuItem>
        <MenuItem value="team">Team</MenuItem>
      </Field.Select>

      {businessType === 'team' && (
        <Field.Text name="businessSize" label="Team Size" type="number" placeholder="Number of team members" />
      )}
      <Field.Text name="experience" label="Years of Experience" type="number" placeholder="Years of experience" />
    </Stack>
  );
}

StepProviderProfile.propTypes = {
  step: PropTypes.number,
};

StepProviderProfile.defaultProps = {
  step: 0,
};
