import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Button from '@mui/material/Button';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';
import { useAddCardMutation, useDeleteCardMutation, useGetCardsQuery, useUpdateCardMutation } from 'src/store/Reducer/cards-api';

import { CardFormDialog } from './card-form-dialog';
import { normalizeCard } from './cards-data';
import { ManageCardsView } from './manage-cards-view';

// ----------------------------------------------------------------------

export function ManageCardsPage() {
  const { t } = useTranslate();
  const { data, isLoading, isFetching } = useGetCardsQuery();
  const [addCard] = useAddCardMutation();
  const [updateCard] = useUpdateCardMutation();
  const [deleteCard] = useDeleteCardMutation();

  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, card: null });
  const [settingDefaultId, setSettingDefaultId] = useState(null);

  const userType = useSelector((state) => state.user?.user?.accountState?.userType);
  const userName = useSelector((state) => state.user?.user?.basicInfo?.name) || '';
  const isCustomer = userType === 'user' || userType === 'customer';

  const cards = useMemo(() => (data?.data || []).map(normalizeCard), [data]);

  const handleOpenAddCard = () => {
    setEditingCard(null);
    setCardDialogOpen(true);
  };

  const handleOpenEditCard = (card) => {
    setEditingCard(card);
    setCardDialogOpen(true);
  };

  const handleCloseCardDialog = () => {
    setCardDialogOpen(false);
    setEditingCard(null);
  };

  const handleSubmitCard = async (payload, card) => {
    try {
      if (card) {
        await updateCard({ id: card.id, ...payload }).unwrap();
        toast.success(t('updateSuccess'));
      } else {
        await addCard(payload).unwrap();
        toast.success(t('cardAddedSuccess'));
      }
    } catch (error) {
      toast.error(error?.data?.message || (card ? t('failedToUpdateCard') : t('failedToAddCard')));
    }
  };

  const handleSetDefault = async (card) => {
    setSettingDefaultId(card.id);
    try {
      await updateCard({
        id: card.id,
        cardHolderName: card.cardHolderName,
        expMonth: card.expMonth,
        expYear: card.expYear,
        isDefault: true,
      }).unwrap();
      toast.success(t('updateSuccess'));
    } catch (error) {
      toast.error(error?.data?.message || t('failedToUpdateCard'));
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDeleteRequest = (cardId) => {
    const card = cards.find((item) => item.id === cardId);
    if (card) {
      setDeleteDialog({ open: true, card });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ open: false, card: null });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.card) return;

    const cardIdToDelete = deleteDialog.card.id;

    try {
      await deleteCard(cardIdToDelete).unwrap();

      if (editingCard?.id === cardIdToDelete) {
        handleCloseCardDialog();
      }

      toast.success(t('deleteSuccessMessage'));
    } catch (error) {
      toast.error(error?.data?.message || t('failedToDeleteCard'));
    } finally {
      handleCancelDelete();
    }
  };

  return (
    <DashboardContent maxWidth={false} sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={t('manageCard')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          ...(isCustomer ? [] : [{ name: t('connect'), href: paths.dashboard.appSettings.connect }]),
          { name: t('manageCard') },
        ]}
        action={
          <Button variant="contained" color="primary" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleOpenAddCard}>
            {t('addCard')}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ManageCardsView
        cards={cards}
        loading={isLoading || isFetching}
        onAddCard={handleOpenAddCard}
        onEditCard={handleOpenEditCard}
        onDeleteCard={handleDeleteRequest}
        onSetDefault={handleSetDefault}
        settingDefaultId={settingDefaultId}
      />

      <CardFormDialog
        open={cardDialogOpen}
        onClose={handleCloseCardDialog}
        onSubmit={handleSubmitCard}
        card={editingCard}
        defaultHolderName={userName}
        isFirstCard={cards.length === 0}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={handleCancelDelete}
        title={t('deleteCard')}
        content={
          <>
            {t('deleteCardMessagePrefix')} <strong>{deleteDialog.card?.cardHolderName}</strong> ({deleteDialog.card?.cardNumber})? {t('actionCannotBeUndone')}
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            {t('deleteAction')}
          </Button>
        }
      />
    </DashboardContent>
  );
}
