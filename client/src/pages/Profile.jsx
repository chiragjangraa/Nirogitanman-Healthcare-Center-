import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  User, Mail, Phone, Calendar, Clock, LogOut, 
  ChevronRight, Activity, ShieldCheck, ShieldAlert 
} from 'lucide-react';

const Profile = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await usersAPI.getProfile();
        setProfileData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Completed': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Cancelled': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-amber-50 text-amber-800 border-amber-200'; // Pending
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Main Container */}
      <main className="flex-grow pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Profile Details Sidebar */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="text-center space-y-3 pb-6 border-b border-slate-100">
              <div className="mx-auto w-20 h-20 bg-teal-50 border border-teal-100 text-teal-600 rounded-full flex items-center justify-center shadow-inner">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 leading-tight">{profileData?.user?.name}</h2>
                <span className="inline-block bg-teal-50 text-teal-700 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full mt-1.5 border border-teal-100/50">
                  Registered Patient
                </span>
              </div>
            </div>

            {/* Profile Info Fields */}
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-slate-700 font-medium">{profileData?.user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-slate-700 font-medium">{profileData?.user?.phone || 'Not Provided'}</p>
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <LogOut className="w-4.5 h-4.5" /> Logout Account
              </button>
            </div>
          </div>

          {/* User Appointments History */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Your Appointment Requests</h3>
              <p className="text-slate-500 text-xs sm:text-sm">Manage or monitor confirmation details of slots requested by you.</p>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-200 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Appointment listing */}
            <div className="space-y-4">
              {profileData?.appointments && profileData.appointments.length > 0 ? (
                profileData.appointments.map((appt) => (
                  <div key={appt._id} className="border border-slate-100 bg-slate-50/50 hover:bg-slate-50 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-teal-600 text-white p-1 rounded-lg shrink-0">
                          <Activity className="w-4 h-4" />
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm sm:text-base">Consultation with {appt.doctor}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          {appt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          Status Updated: {new Date(appt.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className={`text-[10px] font-black px-3.5 py-1 rounded-full border uppercase tracking-wider ${getStatusBadge(appt.status)}`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 p-12 text-center rounded-2xl">
                  <p className="text-slate-400 text-sm">You haven't requested any appointments yet.</p>
                  <Link to="/#contact" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline">
                    Book Your First Appointment <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
