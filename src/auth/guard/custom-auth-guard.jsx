import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

import { paths } from 'src/routes/paths';
import { needsProfileSetup } from 'src/utils/profile-setup';

const ProtectedRoute = ({ children, requiredPermission }) => {

    const { user } = useSelector((state) => state.user);

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (needsProfileSetup(user)) {
        return <Navigate to={paths.auth.jwt.signUpComplete} replace />;
    }

    const hasPermission = Array.isArray(requiredPermission) ? requiredPermission.includes(user?.permission) : user?.permission === requiredPermission;

    if (!hasPermission) {
        return <Navigate to="/404" replace />;
    }

    // Render children or nested routes if all checks pass
    return children || <Outlet />;
};

export default ProtectedRoute;
