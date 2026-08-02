import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AdminGuard } from '../Guards/AdminGuard';
import { AuthGuard } from '../Guards/AuthGuard';
import type { UserRole } from '../../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

/**
 * ProtectedRoute component that routes authorization checks:
 * - Admin routes pass directly through AdminGuard.
 * - Birthday/Viewer routes pass through AuthGuard with role checks.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (allowedRole === 'admin') {
    return <AdminGuard>{children}</AdminGuard>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <AuthGuard>{children}</AuthGuard>;
};
