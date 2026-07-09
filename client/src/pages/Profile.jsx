import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, medicalRecordsAPI, notificationsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  User, Mail, Phone, Calendar, Clock, LogOut,
  ChevronRight, Activity, ShieldAlert, Bell,
  FileText, Edit2, Check, X, Clipboard, CheckCircle2,
  Printer, AlertCircle, RefreshCw
} from 'lucide-react';

const Profile = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveMsg, setProfileSaveMsg] = useState('');

  // Receipt state
  const [receiptAppt, setReceiptAppt] = useState(null);

  const navigate = useNavigate();
  const printRef = useRef();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchAll();
    }
  }, [user, authLoading, navigate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, notifRes] = await Promise.all([
        usersAPI.getProfile().catch(e => null),
        notificationsAPI.getAll().catch(e => ({ data: [] })),
      ]);

      if (profileRes) {
        setProfileData(profileRes.data);
        setEditName(profileRes.data.user?.name || '');
        setEditPhone(profileRes.data.user?.phone || '');

        // Fetch medical records if userId known
        const userId = profileRes.data.user?.id || profileRes.data.user?._id;
        if (userId) {
          const mrRes = await medicalRecordsAPI.getByUserId(userId).catch(() => ({ data: [] }));
          setMedicalRecords(mrRes.data || []);
        }
      }

      setNotifications(notifRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      setProfileSaveMsg('Name and phone are required.');
      return;
    }
    setSavingProfile(true);
    setProfileSaveMsg('');
    try {
      const res = await usersAPI.updateProfile({ name: editName.trim(), phone: editPhone.trim() });
      setProfileData(prev => ({ ...prev, user: { ...prev.user, name: res.data.name, phone: res.data.phone } }));
      setProfileSaveMsg('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      setProfileSaveMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { /* silent */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePrint = (appt) => {
    setReceiptAppt(appt);
    setTimeout(() => window.print(), 300);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Completed': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Cancelled': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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

      {/* Print receipt (hidden on screen) */}
      {receiptAppt && (
        <div className="hidden print:block fixed inset-0 bg-white p-12 z-[9999]">
          <div className="max-w-md mx-auto border-2 border-teal-600 rounded-2xl p-8 space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black text-teal-700">Nirogitanman Healthcare</h1>
              <p className="text-slate-500 text-xs">Appointment Confirmation Slip</p>
            </div>
            <div className="border-t border-dashed border-slate-200 pt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="font-bold text-slate-500">Patient</span><span className="font-bold text-slate-800">{receiptAppt.patientName}</span></div>
              <div className="flex justify-between"><span className="font-bold text-slate-500">Doctor</span><span className="font-bold text-slate-800">{receiptAppt.doctor}</span></div>
              <div className="flex justify-between"><span className="font-bold text-slate-500">Date</span><span className="font-bold text-slate-800">{receiptAppt.date}</span></div>
              <div className="flex justify-between"><span className="font-bold text-slate-500">Time Slot</span><span className="font-bold text-slate-800">{receiptAppt.timeSlot || 'Flexible'}</span></div>
              <div className="flex justify-between"><span className="font-bold text-slate-500">Status</span><span className={`font-black uppercase text-xs px-2 py-0.5 rounded ${receiptAppt.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{receiptAppt.status}</span></div>
              <div className="flex justify-between"><span className="font-bold text-slate-500">Phone</span><span>{receiptAppt.phone}</span></div>
            </div>
            <div className="border-t border-dashed border-slate-200 pt-4 text-center text-[10px] text-slate-400 space-y-1">
              <p>Please arrive 15 minutes before your scheduled appointment.</p>
              <p>Contact: contact@nirogitanman.com | +91 98765 43210</p>
              <p className="font-bold text-slate-600 mt-2">Printed: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <main className="print:hidden flex-grow pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Left: Profile Sidebar ─────────────────── */}
          <div className="lg:col-span-4 space-y-6">

            {/* Profile Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <div className="text-center space-y-3 pb-5 border-b border-slate-100">
                <div className="mx-auto w-20 h-20 bg-teal-50 border-2 border-teal-100 text-teal-600 rounded-full flex items-center justify-center shadow-inner">
                  <User className="w-10 h-10" />
                </div>
                {!editMode ? (
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{profileData?.user?.name}</h2>
                    <span className="inline-block bg-teal-50 text-teal-700 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full mt-1 border border-teal-100">
                      Registered Patient
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full text-center border border-teal-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none"
                      placeholder="Full Name"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="text-slate-700 font-medium">{profileData?.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                    {editMode ? (
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        className="w-full border border-teal-300 rounded-xl px-3 py-2 text-sm focus:outline-none"
                        placeholder="Phone Number"
                      />
                    ) : (
                      <p className="text-slate-700 font-medium">{profileData?.user?.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {profileSaveMsg && (
                <p className={`text-xs font-semibold ${profileSaveMsg.includes('success') ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {profileSaveMsg}
                </p>
              )}

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                {editMode ? (
                  <>
                    <button onClick={handleSaveProfile} disabled={savingProfile} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50">
                      <Check className="w-4 h-4" /> {savingProfile ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => { setEditMode(false); setProfileSaveMsg(''); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1 cursor-pointer">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1 cursor-pointer border border-slate-200">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                )}
              </div>

              <button onClick={handleLogout} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>

            {/* Quick links */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</p>
              <Link to="/#contact" className="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-700 transition-all text-sm font-semibold group">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Book Appointment</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/" className="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-700 transition-all text-sm font-semibold group">
                <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> View Services</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* ── Right: Tab Panel ─────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            {error && (
              <div className="bg-rose-50 text-rose-800 p-4 rounded-2xl border border-rose-200 text-sm flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 shrink-0" />{error}
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex gap-1 overflow-x-auto">
              {[
                { id: 'appointments', label: 'Appointments', icon: Calendar },
                { id: 'medical', label: 'Medical Records', icon: FileText },
                { id: 'notifications', label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: Bell },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5 shrink-0" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Appointments Tab ── */}
            {activeTab === 'appointments' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Your Appointments</h3>
                    <p className="text-slate-500 text-xs font-medium">Track and monitor your consultation bookings</p>
                  </div>
                  <button onClick={fetchAll} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all cursor-pointer" title="Refresh">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {profileData?.appointments?.length > 0 ? (
                    profileData.appointments.map((appt) => (
                      <div key={appt._id} className="border border-slate-100 bg-slate-50/50 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-teal-600 text-white p-1.5 rounded-lg shrink-0">
                              <Activity className="w-3.5 h-3.5" />
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm">Consultation with {appt.doctor}</h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-teal-600" />{appt.date}</span>
                            {appt.timeSlot && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-600" />{appt.timeSlot}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase ${getStatusBadge(appt.status)}`}>
                            {appt.status}
                          </span>
                          <button
                            onClick={() => handlePrint(appt)}
                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all cursor-pointer border border-slate-200"
                            title="Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 p-12 text-center rounded-2xl">
                      <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-medium">No appointments found.</p>
                      <Link to="/#contact" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline">
                        Book Your First Appointment <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Medical Records Tab ── */}
            {activeTab === 'medical' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Medical History</h3>
                  <p className="text-slate-500 text-xs font-medium">View your clinical records, prescriptions, and doctor notes</p>
                </div>

                <div className="space-y-4">
                  {medicalRecords.length > 0 ? (
                    medicalRecords.map((rec) => (
                      <div key={rec._id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-start gap-2.5">
                            <div className="bg-teal-50 border border-teal-100 text-teal-600 p-2 rounded-xl shrink-0">
                              <Clipboard className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">{rec.diagnosis}</h4>
                              <p className="text-xs text-slate-400 font-medium">Dr. {rec.doctorName} · {rec.date}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-xs pl-1">
                          <div>
                            <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Prescription</p>
                            <p className="text-slate-600 bg-white border border-slate-100 p-2.5 rounded-xl font-mono whitespace-pre-line leading-relaxed">
                              {rec.prescription}
                            </p>
                          </div>
                          {rec.notes && (
                            <div>
                              <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Doctor Notes</p>
                              <p className="text-slate-500 italic">"{rec.notes}"</p>
                            </div>
                          )}
                          {rec.reports?.length > 0 && (
                            <div>
                              <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1">Reports</p>
                              <div className="flex flex-wrap gap-1.5">
                                {rec.reports.map((r, i) => (
                                  <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                                    <FileText className="w-3 h-3" />{r}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 p-12 text-center rounded-2xl">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-medium">No medical records found yet.</p>
                      <p className="text-slate-400 text-xs mt-1">Your clinical history will appear here after your consultation.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === 'notifications' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Notifications</h3>
                    <p className="text-slate-500 text-xs font-medium">Appointment updates and clinical alerts</p>
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs font-bold text-teal-600 hover:underline cursor-pointer">
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${notif.isRead ? 'bg-slate-50 border-slate-100' : 'bg-teal-50 border-teal-100'}`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${notif.isRead ? 'bg-slate-100 text-slate-400' : 'bg-teal-100 text-teal-600'}`}>
                          {notif.type === 'Appointment' ? <Calendar className="w-4 h-4" /> :
                           notif.type === 'Medical' ? <FileText className="w-4 h-4" /> :
                           <Bell className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`font-bold text-sm ${notif.isRead ? 'text-slate-600' : 'text-slate-800'}`}>
                              {notif.title}
                              {!notif.isRead && <span className="ml-2 inline-block w-2 h-2 bg-teal-500 rounded-full"></span>}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                          {!notif.isRead && (
                            <button
                              onClick={() => handleMarkRead(notif._id)}
                              className="mt-2 text-[10px] font-bold text-teal-600 hover:underline cursor-pointer"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 p-12 text-center rounded-2xl">
                      <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-medium">No notifications yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
