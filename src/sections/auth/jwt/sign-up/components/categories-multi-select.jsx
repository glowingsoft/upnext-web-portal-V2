import { useState, useEffect, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import { Iconify } from 'src/components/iconify';
import { useDebounce } from 'src/hooks/use-debounce';
import { useGetCategoriesForSignupQuery } from 'src/store/Reducer/categories-api';

const LIMIT = 100;

// ----------------------------------------------------------------------

export function CategoriesMultiSelect({ name = 'categories', label = 'Categories', preloadValues, scope = '', tags }) {
    const { control } = useFormContext();

    const [inputValue, setInputValue] = useState('');
    const [page, setPage] = useState(1);
    const [options, setOptions] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    const debouncedSearch = useDebounce(inputValue, 300);

    // Reset to page 1 whenever search term changes
    useEffect(() => {
        setPage(1);
        setOptions([]);
        setHasMore(true);
    }, [debouncedSearch]);

    // Seed options with preloaded values (stubs / partial objects) so saved chips resolve
    useEffect(() => {
        if (!preloadValues?.length) return;
        setOptions((prev) => {
            const existingIds = new Set(prev.map((o) => o._id));
            const toAdd = preloadValues.filter((v) => v?._id && !existingIds.has(v._id));
            return toAdd.length ? [...prev, ...toAdd] : prev;
        });
    }, [preloadValues]);

    const { data, isFetching } = useGetCategoriesForSignupQuery({
        page,
        limit: LIMIT,
        search: debouncedSearch,
        scope,
        tags,
    });

    useEffect(() => {
        if (!data) return;

        const docs =
            data?.data?.docs ||
            data?.data?.data ||
            (Array.isArray(data?.data) ? data.data : []);

        if (docs.length) {
            setOptions((prev) => {
                const docsById = Object.fromEntries(docs.map((d) => [d._id, d]));
                if (page === 1) {
                    // Enrich any stubs that now have full data, then append truly new docs
                    const enriched = prev.map((p) => docsById[p._id] || p);
                    const newDocs = docs.filter((d) => !prev.some((p) => p._id === d._id));
                    return [...enriched, ...newDocs];
                }
                const prevIds = new Set(prev.map((o) => o._id));
                return [...prev, ...docs.filter((d) => !prevIds.has(d._id))];
            });
        }

        if (docs.length < LIMIT) setHasMore(false);
    }, [data, page]);

    const handleScroll = useCallback(
        (e) => {
            const el = e.currentTarget;
            if (
                el.scrollHeight - el.scrollTop - el.clientHeight < 60 &&
                !isFetching &&
                hasMore
            ) {
                setPage((p) => p + 1);
            }
        },
        [isFetching, hasMore]
    );

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <Autocomplete
                    multiple
                    options={options}
                    value={field.value || []}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    inputValue={inputValue}
                    onInputChange={(_, value, reason) => {
                        if (reason !== 'reset') setInputValue(value);
                    }}
                    getOptionLabel={(opt) => opt?.name || opt?.title || ''}
                    isOptionEqualToValue={(opt, val) => opt?._id === (val?._id || val)}
                    loading={isFetching}
                    disableCloseOnSelect
                    ListboxProps={{
                        onScroll: handleScroll,
                        style: { maxHeight: 240 },
                    }}
                    renderOption={(props, option, { selected }) => {
                        const { key, ...optionProps } = props;
                        return (
                            <li key={key} {...optionProps}>
                                <Checkbox size="small" disableRipple checked={selected} sx={{ mr: 1 }} />
                                {option?.name || option?.title || ''}
                            </li>
                        );
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                            const resolved = options.find((o) => o._id === (option?._id || option)) || option;
                            const { key, ...tagProps } = getTagProps({ index });
                            return (
                                <Chip
                                    key={key}
                                    label={resolved?.name || resolved?.title || ''}
                                    size="small"
                                    color="primary"
                                    {...tagProps}
                                />
                            );
                        })
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={label}
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
