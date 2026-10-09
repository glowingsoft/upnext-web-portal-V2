export function needsProfileSetup(user) {
  const userType = user?.accountState?.userType;
  const isBusiness = userType === 'business' || userType === 'provider';
  const isCustomer = userType === 'user' || userType === 'customer';

  if (!isBusiness && !isCustomer) return false;

  const hasProfile = isBusiness ? user.accountState?.hasBusinessProfile : user.accountState?.hasUserProfile;
  if (typeof hasProfile === 'boolean') return !hasProfile;

  return !user.profile;
}
