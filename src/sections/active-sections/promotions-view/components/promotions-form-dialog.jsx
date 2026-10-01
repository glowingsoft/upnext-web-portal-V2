import { useForm } from 'react-hook-form';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Stack } from '@mui/material';

import { LoadingButton } from '@mui/lab';

import { Form, Field } from 'src/components/hook-form';

const defaultValues = {
  name: '',
  promoType: 'code',
  promoCode: '',

  discountType: 'percentage',
  discountValue: '',

  usageLimit: '',
  perUserLimit: '',

  description: '',

  appliedTo: '',
};

export function PromotionFormDialog({ open, onClose, editData, onSubmit }) {
  const methods = useForm({
    defaultValues: editData || defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editData ? 'Edit Promotion' : 'Add Promotion'}</DialogTitle>

      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5}>
            <Field.Select name="appliedTo" label="Applied To">
              <MenuItem value="pkg001">Service 1</MenuItem>

              <MenuItem value="pkg002">Package 1</MenuItem>
            </Field.Select>

            <Field.Text name="name" label="Promo Name" />

            <Field.Select name="promoType" label="Promo Type">
              <MenuItem value="code">Code Based</MenuItem>

              <MenuItem value="automatic">Automatic</MenuItem>
            </Field.Select>

            <Field.Text name="promoCode" label="Promo Code" />

            <Field.Select name="discountType" label="Discount Type">
              <MenuItem value="percentage">Percentage</MenuItem>

              <MenuItem value="flat">Flat Amount</MenuItem>
            </Field.Select>

            <Field.Text name="discountValue" label="Percentage (%)" />

            <Field.Text name="usageLimit" label="Total Usage Limit" />

            <Field.Text name="perUserLimit" label="Per User Limit" />

            <Field.Text name="description" label="Description" multiline rows={4} />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Save Promotion
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
