import PropTypes from 'prop-types';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { Form, RHFTextField } from 'src/components/hook-form';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

export default function QuickSupportReply({ open, onClose, onSend }) {
  const { t } = useTranslate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = zod.object({
    message: zod.string().min(1, t('messageIsRequired')),
  });

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      message: '',
    },
  });

  const handleClose = () => {
    onClose();
    methods.reset();
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await onSend?.(data.message);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
        <DialogTitle sx={{ pb: 0 }}>{t('reply')}</DialogTitle>
        <DialogContent>
          <RHFTextField name="message" label={t('message')} multiline rows={3} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
            {t('send')}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

QuickSupportReply.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSend: PropTypes.func,
};
