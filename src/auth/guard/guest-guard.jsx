import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { SplashScreen } from 'src/components/loading-screen';
import { selectUser } from 'src/store/slices/userSlice';
import { consumeAuthRedirectPath, consumeLoginNavHandled } from 'src/sections/auth/jwt/auth-redirect-storage';
import { getSignupFlowStage, SIGNUP_FLOW_STAGE } from 'src/sections/auth/jwt/sign-up/signup-flow-storage';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

export function GuestGuard({ children }) {
  const router = useRouter();

  const user = useSelector(selectUser);

  const { loading, authenticated } = useAuthContext();

  const [isChecking, setIsChecking] = useState(true);

  const userType = user?.accountState?.userType;
  const isAdminUser = userType === 'admin' || userType === 'subadmin' || user?.permission === 1;
  const defaultUserPath = isAdminUser ? paths.adminDashboard.root : paths.dashboard.root;

  const checkPermissions = async () => {
    if (loading) {
      return;
    }

    if (authenticated || user) {
      // goTo() in the sign-in view already handled navigation — don't override it
      if (consumeLoginNavHandled()) {
        setIsChecking(false);
        return;
      }

      // User is mid-signup flow (just verified OTP, heading to complete-profile) — let through
      const signupStage = getSignupFlowStage();
      if (signupStage === SIGNUP_FLOW_STAGE.OTP) {
        setIsChecking(false);
        return;
      }

      const storedRedirectPath = consumeAuthRedirectPath();

      if (storedRedirectPath?.startsWith(defaultUserPath)) {
        router.replace(storedRedirectPath);
        return;
      }

      router.replace(defaultUserPath);
      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading, user]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
