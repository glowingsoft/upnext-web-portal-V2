import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useDebounce } from 'src/hooks/use-debounce';
import { useLazyGetTagsQuery } from 'src/store/Reducer/tags-api';

const LIMIT = 100;

export function TagsMultiSelect({ name = 'tags', label = 'Tags', categoryIds = [] }) {
  const { control, setValue } = useFormContext();

  const [inputValue, setInputValue] = useState('');
  const [hasOpened, setHasOpened] = useState(false);
  const debouncedSearch = useDebounce(inputValue, 300);
  const hasCategories = categoryIds.length > 0;

  const [triggerGetTags, { data, isFetching }] = useLazyGetTagsQuery();
  const options = data?.data?.docs || data?.data?.data || (Array.isArray(data?.data) ? data.data : []);
  const handleOpen = () => setHasOpened(true);

  useEffect(() => {
    if (hasOpened && hasCategories) {
      triggerGetTags({ categoryIds, search: debouncedSearch, limit: LIMIT });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasOpened, debouncedSearch, categoryIds.join(',')]);

  useEffect(() => {
    if (!hasCategories) {
      setValue(name, [], { shouldValidate: true });
      setHasOpened(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryIds.join(',')]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          multiple
          disabled={!hasCategories}
          options={isFetching ? [] : options}
          value={field.value || []}
          onChange={(_, newValue) => field.onChange(newValue)}
          onOpen={handleOpen}
          inputValue={inputValue}
          onInputChange={(_, value, reason) => {
            if (reason !== 'reset') setInputValue(value);
          }}
          getOptionLabel={(opt) => opt?.name || ''}
          isOptionEqualToValue={(opt, val) => opt?._id === (val?._id || val)}
          loading={isFetching}
          disableCloseOnSelect
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <Box
                component="li"
                key={key}
                {...optionProps}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                  <Checkbox size="small" disableRipple checked={selected} sx={{ mr: 1 }} />
                  <Typography variant="body2" noWrap>
                    {option?.name || ''}
                  </Typography>
                </Box>
                {option?.category?.name && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', flexShrink: 0 }}>
                    ({option.category.name})
                  </Typography>
                )}
              </Box>
            );
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const resolved = options.find((o) => o._id === (option?._id || option)) || option;
              const { key, ...tagProps } = getTagProps({ index });
              return <Chip key={key} label={resolved?.name || ''} size="small" color="primary" {...tagProps} />;
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={hasCategories ? undefined : 'Select a category first'}
              error={!!error}
              helperText={error?.message}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" width={18} sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {isFetching && <CircularProgress size={16} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      )}
    />
  );
}
