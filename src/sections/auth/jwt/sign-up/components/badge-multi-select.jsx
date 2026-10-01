import { Controller, useFormContext } from 'react-hook-form';

import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

/**
 * Multi-select autocomplete for a badge (e.g. Service Preferences).
 * Stores an array of { badgeId, optionId, badgeName, optionName } in the form field.
 */
export function BadgeMultiSelect({ fieldName, badge }) {
    const { control } = useFormContext();
    const options = badge?.options || [];

    const badgeLabel = badge?.translations?.en || badge?.name || fieldName;
    const getOptionLabel = (opt) => opt?.translations?.en || opt?.name || '';

    return (
        <Controller
            name={fieldName}
            control={control}
            render={({ field, fieldState: { error } }) => {
                const value = Array.isArray(field.value) ? field.value : [];

                const selectedOptions = value
                    .map((v) => options.find((o) => o._id === v?.optionId))
                    .filter(Boolean);

                return (
                    <Autocomplete
                        multiple
                        options={options}
                        value={selectedOptions}
                        onChange={(_, newValues) => {
                            field.onChange(
                                newValues.map((opt) => ({
                                    badgeId: badge._id,
                                    optionId: opt._id,
                                    badgeName: badgeLabel,
                                    optionName: getOptionLabel(opt),
                                }))
                            );
                        }}
                        getOptionLabel={getOptionLabel}
                        isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
                        renderTags={(tagValues, getTagProps) =>
                            tagValues.map((option, index) => {
                                const { key, ...tagProps } = getTagProps({ index });
                                return (
                                    <Chip
                                        key={key}
                                        label={getOptionLabel(option)}
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
                                label={badgeLabel}
                                error={!!error}
                                helperText={error?.message}
                            />
                        )}
                    />
                );
            }}
        />
    );
}
