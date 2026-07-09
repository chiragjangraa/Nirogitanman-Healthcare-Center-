import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute: Guards all /admin/dashboard/* routes.
 * Only users with role === 'admin' are allowed through.
 * Regular users (patients) are redirected to /admin/login.
 */
const ProtectedRoute = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // Must be logged in AND be an admin
  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
