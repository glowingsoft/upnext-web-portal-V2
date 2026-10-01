import { useEffect, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales/use-locales';
import { stripePromise } from 'src/lib/stripe';

import { AddCardFields, EditCardFields, isAddCardFormValid, isEditCardFormValid } from './card-form-fields';

// ----------------------------------------------------------------------

const EMPTY_EDIT_FORM = { cardHolderName: '', cardNumber: '', expMonth: null, expYear: null, isDefault: false };

function CardFormDialogContent({ open, onClose, onSubmit, card = null }) {
  const { t } = useTranslate();
  const stripe = useStripe();
  const elements = useElements();
  const isEdit = Boolean(card);

  const [editForm, setEditForm] = useState({ ...EMPTY_EDIT_FORM });
  const [cardHolderName, setCardHolderName] = useState('');
  const [setDefault, setSetDefault] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (card) {
      setEditForm({ ...EMPTY_EDIT_FORM, ...card });
    } else {
      setCardHolderName('');
      setSetDefault(false);
      setCardComplete(false);
      setCardError(null);
      elements?.getElement(CardElement)?.clear();
    }
  }, [card, open, elements]);

  const handleEditFieldChange = (field) => (value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCardElementChange = (event) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };

  const handleClose = () => {
    setEditForm({ ...EMPTY_EDIT_FORM });
    setCardHolderName('');
    setSetDefault(false);
    setCardComplete(false);
    setCardError(null);
    onClose();
  };

  const handleSubmitEdit = async () => {
    setLoading(true);
    try {
      await onSubmit(
        {
          cardHolderName: editForm.cardHolderName.trim(),
          expMonth: editForm.expMonth,
          expYear: editForm.expYear,
          isDefault: editForm.isDefault,
        },
        card
      );
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdd = async () => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setLoading(true);
    setCardError(null);

    try {
      const result = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name: cardHolderName.trim() },
      });

      if (result.error) {
        setCardError(result.error.message);
        toast.error(result.error.message);
        return;
      }

      await onSubmit(
        {
          paymentMethodId: result.paymentMethod.id,
          cardHolderName: cardHolderName.trim(),
          setDefault,
        },
        null
      );
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const isValid = isEdit ? isEditCardFormValid(editForm) : isAddCardFormValid({ cardHolderName, cardComplete });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
        <Typography variant="h6" fontWeight={700}>
          {isEdit ? t('editCard') : t('addCard')}
        </Typography>
        <IconButton size="small" onClick={handleClose} aria-label={t('close')}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: '16px !important' }}>
        {isEdit ? (
          <EditCardFields values={editForm} onChange={handleEditFieldChange} />
        ) : (
          <AddCardFields
            cardHolderName={cardHolderName}
            onCardHolderNameChange={setCardHolderName}
            setDefault={setDefault}
            onSetDefaultChange={setSetDefault}
            onCardElementChange={handleCardElementChange}
            cardError={cardError}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="outlined" onClick={handleClose}>
          {t('cancel')}
        </Button>
        <LoadingButton
          variant="contained"
          color="primary"
          sx={{ px: 2 }}
          loading={loading}
          onClick={isEdit ? handleSubmitEdit : handleSubmitAdd}
          disabled={!isValid}
        >
          {isEdit ? t('saveChanges') : t('addCard')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export function CardFormDialog({ open, onClose, onSubmit, card = null }) {
  return (
    <Elements stripe={stripePromise}>
      <CardFormDialogContent open={open} onClose={onClose} onSubmit={onSubmit} card={card} />
    </Elements>
  );
}
