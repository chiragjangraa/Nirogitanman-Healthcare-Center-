import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { LogOut, Globe, User } from 'lucide-react';

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Admin Control Panel</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-1 text-slate-500 hover:text-teal-600 font-semibold text-sm transition-colors"
            >
              <Globe className="w-4 h-4" />
              Visit Site
            </Link>

            <div className="h-6 w-px bg-slate-200"></div>

            {/* Profile Dropdown / Widget */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-full text-slate-600 border border-slate-200">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-500 font-medium">{user?.role || 'Admin'}</p>
              </div>
              
              <button
                onClick={handleLogout}
                title="Logout"
                className="ml-2 text-slate-400 hover:text-rose-600 transition-colors p-1.5 hover:bg-rose-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Route View */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
