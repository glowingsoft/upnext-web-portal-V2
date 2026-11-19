import { useState } from 'react';
import { useSelector } from 'react-redux';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { stripePromise } from 'src/lib/stripe';
import { useAddCardMutation } from 'src/store/Reducer/cards-api';
import { AddCardFields, isAddCardFormValid } from 'src/sections/active-sections/cards-view/card-form-fields';

function InlineAddCardForm({ isFirstCard, onAdded, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [addCard] = useAddCardMutation();
  const defaultName = useSelector((state) => state.user?.user?.basicInfo?.name) || '';

  const [cardHolderName, setCardHolderName] = useState(defaultName);
  const [setDefault, setSetDefault] = useState(isFirstCard);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setSaving(true);
    setCardError(null);
    try {
      const result = await stripe.createPaymentMethod({ type: 'card', card: cardElement, billing_details: { name: cardHolderName.trim() } });
      if (result.error) {
        setCardError(result.error.message);
        return;
      }
      await addCard({ paymentMethodId: result.paymentMethod.id, cardHolderName: cardHolderName.trim(), setDefault }).unwrap();
      toast.success('Card added');
      onAdded(result.paymentMethod.id);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Could not add the card');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2, borderRadius: 1.5, border: '1.5px solid', borderColor: 'primary.main' }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        New card
      </Typography>
      <AddCardFields
        cardHolderName={cardHolderName}
        onCardHolderNameChange={setCardHolderName}
        setDefault={setDefault}
        onSetDefaultChange={setSetDefault}
        onCardElementChange={(event) => {
          setCardComplete(event.complete);
          setCardError(event.error ? event.error.message : null);
        }}
        cardError={cardError}
      />
      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
        <Button color="inherit" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <LoadingButton variant="contained" color="primary" loading={saving} disabled={!isAddCardFormValid({ cardHolderName, cardComplete })} onClick={handleSave}>
          Save card
        </LoadingButton>
      </Stack>
    </Box>
  );
}

export function InlineAddCard(props) {
  return (
    <Elements stripe={stripePromise}>
      <InlineAddCardForm {...props} />
    </Elements>
  );
}
