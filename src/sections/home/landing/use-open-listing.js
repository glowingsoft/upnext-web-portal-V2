import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { getItemId } from 'src/sections/active-sections/services-view/customer-services-view';

export function useOpenListing() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const userType = user?.accountState?.userType;
  const isCustomer = userType === 'customer' || userType === 'user';

  return useCallback(
    (item, kind) => {
      if (!user) {
        navigate(paths.auth.jwt.signIn);
        return;
      }

      const itemId = getItemId(item);
      if (!itemId) return;

      if (!isCustomer) {
        if (item.providerId) {
          navigate(paths.stylist.details(item.business?.nameSlug || item.providerId), {
            state: { businessId: item.providerId },
          });
        }
        return;
      }

      if (kind === 'packages') {
        navigate(paths.dashboard.packageDetails(itemId));
        return;
      }

      navigate(paths.dashboard.serviceDetails(itemId), { state: { service: item } });
    },
    [navigate, user, isCustomer]
  );
}
