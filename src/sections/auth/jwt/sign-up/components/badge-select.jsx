import { Controller, useFormContext } from 'react-hook-form';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

export function BadgeSelect({ fieldName, badge, optional = false }) {
    const { control } = useFormContext();
    const options = badge?.options || [];

    const badgeLabel = `${badge?.translations?.en || badge?.name || fieldName}${optional ? ' (Optional)' : ''}`;
    const getOptionLabel = (opt) => opt?.translations?.en || opt?.name || '';

    return (
        <Controller
            name={fieldName}
            control={control}
            render={({ field, fieldState: { error } }) => {
                const selectedOption = field.value
                    ? options.find((o) => o._id === field.value?.optionId) ?? null
                    : null;

                return (
                    <Autocomplete
                        options={options}
                        value={selectedOption}
                        onChange={(_, newValue) => {
                            field.onChange(
                                newValue
                                    ? {
                                        badgeId: badge._id,
                                        optionId: newValue._id,
                                        badgeName: badgeLabel,
                                        optionName: getOptionLabel(newValue),
                                    }
                                    : null
                            );
                        }}
                        getOptionLabel={(opt) => opt?.translations?.en || opt?.name || ''}
                        isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={badgeLabel}
                                InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
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
