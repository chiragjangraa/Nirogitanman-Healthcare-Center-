import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
