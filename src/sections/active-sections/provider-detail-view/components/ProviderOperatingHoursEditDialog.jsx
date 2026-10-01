import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';

import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';
import { OPERATING_DAYS, validateOperatingHoursWindows } from 'src/utils/operating-hours';
import { useUpdateBusinessOperatingHoursMutation } from 'src/store/Reducer/businesses-api';

import { DayCard } from './operating-hours-day-card';

const DAY_KEY_TO_SHORT = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

export default function ProviderOperatingHoursEditDialog({ open, onClose, businessId, initialHours }) {
  const { t } = useTranslate();
  const [hours, setHours] = useState(initialHours || {});
  const [errors, setErrors] = useState({});
  const [updateOperatingHours, { isLoading }] = useUpdateBusinessOperatingHoursMutation();

  useEffect(() => {
    if (open) setHours(initialHours || {});
  }, [open, initialHours]);

  useEffect(() => {
    setErrors(validateOperatingHoursWindows(hours));
  }, [hours]);

  const handleToggle = (day) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        enabled: !prev[day]?.enabled,
        startTime: prev[day]?.startTime || '09:00',
        endTime: prev[day]?.endTime || '18:00',
        breaks: prev[day]?.breaks || [],
      },
    }));
  };

  const handleWindowChange = (day, field, value) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const handleAddBreak = (day) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], breaks: [...(prev[day]?.breaks || []), { start: '13:00', end: '14:00' }] },
    }));
  };

  const handleBreakChange = (day, index, field, value) => {
    setHours((prev) => {
      const breaks = (prev[day]?.breaks || []).map((brk, i) => (i === index ? { ...brk, [field]: value } : brk));
      return { ...prev, [day]: { ...prev[day], breaks } };
    });
  };

  const handleRemoveBreak = (day, index) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], breaks: (prev[day]?.breaks || []).filter((_, i) => i !== index) },
    }));
  };

  const handleSave = async () => {
    if (Object.keys(errors).length > 0) return;

    try {
      const operatingHours = OPERATING_DAYS.map((day) => {
        const dayData = hours[day];
        if (!dayData?.enabled) {
          return { dayOfWeek: DAY_KEY_TO_SHORT[day], isOpen: false, breaks: [] };
        }
        return {
          dayOfWeek: DAY_KEY_TO_SHORT[day],
          isOpen: true,
          startTime: dayData.startTime,
          endTime: dayData.endTime,
          breaks: dayData.breaks || [],
        };
      });

      await updateOperatingHours({ businessId, operatingHours }).unwrap();
      toast.success(t('updateSuccess'));
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || t('failedToUpdateOperatingHours'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('editOperatingHours')}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '70vh' }}>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {OPERATING_DAYS.map((day) => (
            <DayCard
              key={day}
              day={day}
              data={hours[day] || { enabled: false, startTime: '09:00', endTime: '18:00', breaks: [] }}
              errors={errors[day]}
              onToggle={() => handleToggle(day)}
              onWindowChange={(field, value) => handleWindowChange(day, field, value)}
              onAddBreak={() => handleAddBreak(day)}
              onBreakChange={(index, field, value) => handleBreakChange(day, index, field, value)}
              onRemoveBreak={(index) => handleRemoveBreak(day, index)}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          {t('cancel')}
        </Button>
        <LoadingButton
          color="primary"
          variant="contained"
          loading={isLoading}
          disabled={Object.keys(errors).length > 0}
          onClick={handleSave}
        >
          {t('update')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

ProviderOperatingHoursEditDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  businessId: PropTypes.string,
  initialHours: PropTypes.object,
};
