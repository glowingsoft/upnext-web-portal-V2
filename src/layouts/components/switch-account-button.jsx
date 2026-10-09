import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales/use-locales';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { setUser, selectUser } from 'src/store/slices/userSlice';
import { authApi, useSwitchAccountMutation } from 'src/store/Reducer/auth';
import { goToPostLogin } from 'src/sections/auth/jwt/auth-redirect-storage';
import { chatApi } from 'src/store/Reducer/chat-api';
import { cardsApi } from 'src/store/Reducer/cards-api';
import { badgesApi } from 'src/store/Reducer/badges-api';
import { walletsApi } from 'src/store/Reducer/wallets-api';
import { bookingsApi } from 'src/store/Reducer/bookings-api';
import { servicesApi } from 'src/store/Reducer/services-api';
import { settingsApi } from 'src/store/Reducer/settings-api';
import { customersApi } from 'src/store/Reducer/customers-api';
import { businessesApi } from 'src/store/Reducer/businesses-api';
import { categoriesApi } from 'src/store/Reducer/categories-api';
import { notificationsApi } from 'src/store/Reducer/notifications-api';

// ----------------------------------------------------------------------

const CUSTOMER_USER_TYPES = ['user', 'customer'];
const ADMIN_USER_TYPES = ['admin', 'subadmin'];

export function SwitchAccountButton({ onClose, ...other }) {
  const { t } = useTranslate();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [switchAccount, { isLoading }] = useSwitchAccountMutation();

  const userType = user?.accountState?.userType;

  const handleSwitch = useCallback(async () => {
    try {
      const response = await switchAccount().unwrap();
      const nextUser = response?.data;

      if (!nextUser) {
        toast.error(t('unableToSwitchAccount'));
        return;
      }

      let permission = 2;
      if (ADMIN_USER_TYPES.includes(nextUser?.accountState?.userType)) permission = 1;

      dispatch(setUser({ ...nextUser, permission }));

      dispatch(authApi.util.resetApiState());
      dispatch(bookingsApi.util.resetApiState());
      dispatch(businessesApi.util.resetApiState());
      dispatch(cardsApi.util.resetApiState());
      dispatch(categoriesApi.util.resetApiState());
      dispatch(chatApi.util.resetApiState());
      dispatch(customersApi.util.resetApiState());
      dispatch(servicesApi.util.resetApiState());
      dispatch(settingsApi.util.resetApiState());
      dispatch(walletsApi.util.resetApiState());
      dispatch(badgesApi.util.resetApiState());
      dispatch(notificationsApi.util.resetApiState());

      onClose?.();
      goToPostLogin(router, paths, permission, nextUser?.accountState?.userType, nextUser?.profile);
      toast.success(response?.message || t('accountSwitchedSuccessfully'));
    } catch (error) {
      const message = error?.data?.message || error?.message;
      toast.error(typeof message === 'string' ? message : t('unableToSwitchAccount'));
    }
  }, [switchAccount, dispatch, onClose, router, t]);

  // Switching roles only makes sense for customer/business accounts.
  if (ADMIN_USER_TYPES.includes(userType)) return null;

  const isCustomer = CUSTOMER_USER_TYPES.includes(userType);

  return (
    <LoadingButton
      fullWidth
      variant="soft"
      size="large"
      color="primary"
      loading={isLoading}
      onClick={handleSwitch}
      startIcon={<Iconify icon="solar:refresh-circle-bold-duotone" />}
      {...other}
    >
      {isCustomer ? t('switchToBusinessAccount') : t('switchToCustomerAccount')}
    </LoadingButton>
  );
}
