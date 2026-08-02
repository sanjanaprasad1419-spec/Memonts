import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isAuthorizedAdminEmail } from '../../config/auth.config';
import { supabase } from '../../lib/supabase';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard enforces Admin Authorization.
 * Verifies that the authenticated Supabase user email matches the configured Admin Email.
 * If unauthorized, immediately signs out and redirects to /login with error state.
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const verifyAdminAuthorization = async () => {
      if (isLoading) return;

      if (!isAuthenticated || !user) {
        if (isMounted) {
          setIsAuthorized(false);
          setIsVerifying(false);
        }
        return;
      }

      // Verify user has admin role
      if (user.role !== 'admin') {
        if (isMounted) {
          setIsAuthorized(false);
          setIsVerifying(false);
        }
        return;
      }

      try {
        // Query Supabase user to perform strict email authorization check
        const { data } = await supabase.auth.getUser();
        const activeEmail = data?.user?.email || user.email;

        if (isAuthorizedAdminEmail(activeEmail)) {
          if (isMounted) {
            setIsAuthorized(true);
            setIsVerifying(false);
          }
        } else {
          // Unauthorized email: immediately sign out
          console.warn(`[AdminGuard] Unauthorized access attempt by email: ${activeEmail}`);
          await logout();
          if (isMounted) {
            setIsAuthorized(false);
            setIsVerifying(false);
          }
        }
      } catch (error) {
        console.error('[AdminGuard] Authorization verification error:', error);
        await logout();
        if (isMounted) {
          setIsAuthorized(false);
          setIsVerifying(false);
        }
      }
    };

    verifyAdminAuthorization();

    return () => {
      isMounted = false;
    };
  }, [isLoading, isAuthenticated, user, logout]);

  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Verifying Admin authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          authError: 'You are not authorized to access the Admin Panel.',
        }}
        replace
      />
    );
  }

  return <>{children}</>;
};
