import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Activity, Calendar, 
  MessageSquare, BookOpen, Image, Settings, LogOut, Heart, FileText, HelpCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard, end: true },
    { name: 'Doctors', path: '/admin/dashboard/doctors', icon: Users },
    { name: 'Services', path: '/admin/dashboard/services', icon: Activity },
    { name: 'Appointments', path: '/admin/dashboard/appointments', icon: Calendar },
    { name: 'Medical Records', path: '/admin/dashboard/medical-records', icon: FileText },
    { name: 'Messages', path: '/admin/dashboard/messages', icon: MessageSquare },
    { name: 'Blogs', path: '/admin/dashboard/blogs', icon: BookOpen },
    { name: 'Gallery', path: '/admin/dashboard/gallery', icon: Image },
    { name: 'FAQs', path: '/admin/dashboard/faqs', icon: HelpCircle },
    { name: 'Settings', path: '/admin/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 shadow-xl shrink-0">
      <div>
        {/* Brand/Header */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-2">
          <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">Nirogitanman</span>
            <span className="block text-[8px] uppercase tracking-wider text-emerald-400 font-medium -mt-0.5">Admin Dashboard</span>
          </div>
        </div>

        {/* User Card */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Logged in as</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5 truncate">{user?.name || 'Administrator'}</p>
          <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
        </div>

        {/* Nav list */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
