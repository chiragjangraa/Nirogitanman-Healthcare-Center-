import React, { useEffect, useState } from 'react';
import { usersAPI, appointmentsAPI, medicalRecordsAPI, notificationsAPI } from '../services/api';
import {
  UserCheck, Search, RefreshCw, Phone, Mail, Calendar,
  FileText, Bell, ChevronDown, ChevronUp, AlertCircle,
  User, Clock, CheckCircle2, XCircle, X, Send
} from 'lucide-react';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [patientDetails, setPatientDetails] = useState({}); // { [userId]: { appointments, records } }
  const [loadingDetail, setLoadingDetail] = useState(null);

  // Notification modal
  const [notifModal, setNotifModal] = useState(false);
  const [notifTarget, setNotifTarget] = useState(null);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'Info' });
  const [notifSending, setNotifSending] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [patientsRes, apptsRes] = await Promise.all([
        usersAPI.getAll(),
        appointmentsAPI.getAll().catch(() => ({ data: [] }))
      ]);
      setPatients(patientsRes.data || []);
      setAppointments(apptsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  const getPatientAppointments = (patient) => {
    return appointments.filter(a =>
      (a.userId && (a.userId === patient._id || a.userId === String(patient._id))) ||
      (a.email && a.email === patient.email)
    );
  };

  const getAppointmentCount = (patient) => getPatientAppointments(patient).length;

  const handleExpand = async (patient) => {
    const id = patient._id;
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (patientDetails[id]) return; // Already loaded

    setLoadingDetail(id);
    try {
      const recordsRes = await medicalRecordsAPI.getByUserId(id).catch(() => ({ data: [] }));
      const appts = getPatientAppointments(patient);
      setPatientDetails(prev => ({
        ...prev,
        [id]: { appointments: appts, records: recordsRes.data || [] }
      }));
    } catch (e) {
      setPatientDetails(prev => ({ ...prev, [id]: { appointments: getPatientAppointments(patient), records: [] } }));
    } finally {
      setLoadingDetail(null);
    }
  };

  const openNotifModal = (patient) => {
    setNotifTarget(patient);
    setNotifForm({ title: '', message: '', type: 'Info' });
    setNotifMsg('');
    setNotifModal(true);
  };

  const handleSendNotification = async () => {
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      setNotifMsg('Please enter both title and message.');
      return;
    }
    setNotifSending(true);
    setNotifMsg('');
    try {
      await notificationsAPI.send({
        userId: notifTarget._id,
        title: notifForm.title.trim(),
        message: notifForm.message.trim(),
        type: notifForm.type
      });
      setNotifMsg('✓ Notification sent successfully!');
      setTimeout(() => { setNotifModal(false); setNotifMsg(''); }, 1500);
    } catch (err) {
      setNotifMsg(err.response?.data?.message || 'Failed to send notification.');
    } finally {
      setNotifSending(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Completed': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Cancelled': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Patient Management</h2>
          <p className="text-slate-500 text-sm mt-0.5">View and manage all registered patients</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: patients.length, color: 'from-teal-500 to-emerald-500', icon: UserCheck },
          { label: 'Total Appointments', value: appointments.length, color: 'from-blue-500 to-cyan-500', icon: Calendar },
          { label: 'Pending', value: appointments.filter(a => a.status === 'Pending').length, color: 'from-amber-500 to-orange-500', icon: Clock },
          { label: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, color: 'from-emerald-500 to-teal-500', icon: CheckCircle2 },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`bg-gradient-to-br ${stat.color} text-white p-3 rounded-xl shadow-sm shrink-0`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl p-4 flex items-center gap-2 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />{error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-teal-400 bg-white shadow-sm"
        />
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">
            Registered Patients
            <span className="ml-2 text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredPatients.length}
            </span>
          </h3>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="py-16 text-center">
            <User className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium text-sm">No patients found{searchTerm ? ' matching your search' : ''}.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPatients.map((patient) => {
              const isExpanded = expandedId === patient._id;
              const apptCount = getAppointmentCount(patient);
              const detail = patientDetails[patient._id];
              const isLoadingThis = loadingDetail === patient._id;

              return (
                <div key={patient._id} className="transition-all">
                  {/* Patient Row */}
                  <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 border border-teal-200 flex items-center justify-center shrink-0 text-teal-700 font-black text-sm">
                        {patient.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{patient.name}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <Mail className="w-3 h-3" />{patient.email}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <Phone className="w-3 h-3" />{patient.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats badges */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-center px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Appointments</p>
                        <p className="text-sm font-black text-blue-700">{apptCount}</p>
                      </div>
                      <div className="text-center px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined</p>
                        <p className="text-xs font-bold text-slate-600">
                          {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <button
                        onClick={() => openNotifModal(patient)}
                        title="Send Notification"
                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all border border-slate-200 cursor-pointer"
                      >
                        <Bell className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleExpand(patient)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? 'Collapse' : 'Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-100 px-6 py-5 space-y-5">
                      {isLoadingThis ? (
                        <div className="flex justify-center py-6">
                          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <>
                          {/* Appointments sub-table */}
                          <div>
                            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-teal-600" /> Appointment History
                            </h4>
                            {detail?.appointments?.length > 0 ? (
                              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                <table className="w-full text-left">
                                  <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      <th className="px-4 py-2.5">Doctor</th>
                                      <th className="px-4 py-2.5">Date</th>
                                      <th className="px-4 py-2.5">Time Slot</th>
                                      <th className="px-4 py-2.5 text-right">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-xs">
                                    {detail.appointments.map(appt => (
                                      <tr key={appt._id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-semibold text-slate-700">{appt.doctor}</td>
                                        <td className="px-4 py-3 text-slate-500">{appt.date}</td>
                                        <td className="px-4 py-3 text-slate-500">{appt.timeSlot || '—'}</td>
                                        <td className="px-4 py-3 text-right">
                                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusColor(appt.status)}`}>
                                            {appt.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic pl-1">No appointments found for this patient.</p>
                            )}
                          </div>

                          {/* Medical Records sub-table */}
                          <div>
                            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-teal-600" /> Medical Records
                              <span className="ml-1 text-[10px] bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full font-semibold">
                                {detail?.records?.length || 0}
                              </span>
                            </h4>
                            {detail?.records?.length > 0 ? (
                              <div className="space-y-2">
                                {detail.records.map(rec => (
                                  <div key={rec._id} className="bg-white border border-slate-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div>
                                      <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Diagnosis</p>
                                      <p className="font-semibold text-slate-700">{rec.diagnosis}</p>
                                    </div>
                                    <div>
                                      <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Doctor</p>
                                      <p className="text-slate-600">{rec.doctorName}</p>
                                    </div>
                                    <div>
                                      <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Date</p>
                                      <p className="text-slate-600">{rec.date}</p>
                                    </div>
                                    {rec.prescription && (
                                      <div className="sm:col-span-3">
                                        <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Prescription</p>
                                        <p className="text-slate-600 font-mono bg-slate-50 p-2 rounded-lg">{rec.prescription}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic pl-1">No medical records found for this patient.</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Send Notification Modal */}
      {notifModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Send Notification</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  To: <span className="font-semibold text-teal-700">{notifTarget?.name}</span>
                </p>
              </div>
              <button onClick={() => setNotifModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Notification Title</label>
                <input
                  type="text"
                  value={notifForm.title}
                  onChange={e => setNotifForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Appointment Reminder"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Message</label>
                <textarea
                  rows={3}
                  value={notifForm.message}
                  onChange={e => setNotifForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter your message for the patient..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Type</label>
                <select
                  value={notifForm.type}
                  onChange={e => setNotifForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 appearance-none cursor-pointer"
                >
                  <option value="Info">Info</option>
                  <option value="Appointment">Appointment</option>
                  <option value="Medical">Medical</option>
                  <option value="System">System</option>
                </select>
              </div>
            </div>

            {notifMsg && (
              <p className={`text-sm font-semibold ${notifMsg.includes('✓') ? 'text-emerald-600' : 'text-rose-600'}`}>
                {notifMsg}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSendNotification}
                disabled={notifSending}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> {notifSending ? 'Sending...' : 'Send Notification'}
              </button>
              <button
                onClick={() => setNotifModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePatients;
