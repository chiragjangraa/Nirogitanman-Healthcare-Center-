import React, { useEffect, useState } from 'react';
import { appointmentsAPI, doctorsAPI } from '../services/api';
import { Search, Calendar, ShieldCheck, Clock, XCircle, CheckCircle, User } from 'lucide-react';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [doctorFilter, setDoctorFilter] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, docsRes] = await Promise.all([
        appointmentsAPI.getAll(),
        doctorsAPI.getAll()
      ]);
      setAppointments(apptRes.data);
      setDoctorsList(docsRes.data);
    } catch (err) {
      console.error('Failed to load appointments list or doctor list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await appointmentsAPI.updateStatus(id, newStatus);
      setAppointments(appointments.map(a => a._id === id ? res.data : a));
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Completed':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default: // Pending
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = 
      appt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.phone.includes(searchTerm);
      
    const matchesStatus = statusFilter === 'All' || appt.status === statusFilter;
    const matchesDoctor = doctorFilter === 'All' || appt.doctor === doctorFilter;
    
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Appointment Bookings</h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium">View patient appointments, check preferred dates, and update confirmation status.</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 items-center gap-2.5 w-full md:max-w-md">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by patient name, doctor, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-sm focus:outline-none text-slate-700 placeholder-slate-400 w-full"
            />
          </div>

          {/* Doctor filter dropdown */}
          <div className="w-full md:w-64">
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:outline-none rounded-xl px-4 py-2.5 text-sm cursor-pointer"
            >
              <option value="All">Filter by Doctor: All</option>
              {doctorsList.map(doc => (
                <option key={doc._id} value={doc.name}>{doc.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['All', 'Pending', 'Approved', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6">Patient Details</th>
                  <th className="py-4 px-6">Assigned Doctor</th>
                  <th className="py-4 px-6">Date & Slot</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAppointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/20 transition-colors">
                    {/* Patient detail */}
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-extrabold text-slate-800">{appt.patientName}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{appt.phone} • {appt.email}</p>
                      </div>
                    </td>

                    {/* Assigned doctor */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-700">{appt.doctor}</p>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5 text-slate-500 text-xs font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{appt.date}</span>
                        </span>
                        <span className="flex items-center gap-1 pl-4.5 text-[10px] text-slate-400 font-bold">
                          {appt.timeSlot || 'Any Time'}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${getStatusBadge(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>

                    {/* Actions controls */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {appt.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(appt._id, 'Approved')}
                              title="Approve Booking"
                              className="bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 border border-emerald-200 hover:border-emerald-500 p-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(appt._id, 'Cancelled')}
                              title="Cancel Booking"
                              className="bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-700 border border-rose-200 hover:border-rose-500 p-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {appt.status === 'Approved' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(appt._id, 'Completed')}
                              title="Complete Booking"
                              className="bg-sky-50 hover:bg-sky-500 hover:text-white text-sky-700 border border-sky-200 hover:border-sky-500 p-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(appt._id, 'Cancelled')}
                              title="Cancel Booking"
                              className="bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-700 border border-rose-200 hover:border-rose-500 p-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {['Completed', 'Cancelled'].includes(appt.status) && (
                          <span className="text-slate-400 text-xs font-semibold">Closed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-sm">No appointment bookings found matching filters.</p>
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;
