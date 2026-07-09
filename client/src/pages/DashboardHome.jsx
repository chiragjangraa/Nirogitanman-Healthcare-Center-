import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, ChevronRight,
  CheckSquare, Clock, UserCheck, Users, Calendar, Activity
} from 'lucide-react';
import { 
  doctorsAPI, appointmentsAPI, messagesAPI, usersAPI 
} from '../services/api';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    appointments: 0,
    doctors: 0,
    messages: 0,
    patients: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });
  const [latestAppts, setLatestAppts] = useState([]);
  const [latestMsgs, setLatestMsgs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docs, appts, msgs, patientsRes] = await Promise.all([
          doctorsAPI.getAll().catch(() => ({ data: [] })),
          appointmentsAPI.getAll().catch(() => ({ data: [] })),
          messagesAPI.getAll().catch(() => ({ data: [] })),
          usersAPI.getAll().catch(() => ({ data: [] }))
        ]);

        const allAppts = appts.data || [];
        const pending = allAppts.filter(a => a.status === 'Pending').length;
        const completed = allAppts.filter(a => a.status === 'Completed').length;

        setStats({
          doctors: (docs.data || []).length,
          appointments: allAppts.length,
          messages: (msgs.data || []).length,
          patients: (patientsRes.data || []).length,
          pendingAppointments: pending,
          completedAppointments: completed
        });

        // Group appointments by month for chart
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = new Date().getMonth();
        const monthlyMap = {};
        for (let i = 5; i >= 0; i--) {
          const idx = (currentMonthIdx - i + 12) % 12;
          monthlyMap[monthNames[idx]] = 0;
        }
        allAppts.forEach(appt => {
          const dateSource = appt.createdAt || appt.date;
          if (dateSource) {
            try {
              const d = new Date(dateSource);
              const mName = monthNames[d.getMonth()];
              if (monthlyMap[mName] !== undefined) monthlyMap[mName]++;
            } catch (e) { /* skip */ }
          }
        });
        setChartData(Object.keys(monthlyMap).map(month => ({ month, count: monthlyMap[month] })));

        setLatestAppts(allAppts.slice(0, 5));
        setLatestMsgs((msgs.data || []).slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Completed': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Cancelled': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const statCards = [
    { name: 'Total Patients', value: stats.patients, icon: UserCheck, color: 'from-blue-500 to-cyan-500' },
    { name: 'Total Doctors', value: stats.doctors, icon: Users, color: 'from-teal-500 to-emerald-500' },
    { name: 'Total Appointments', value: stats.appointments, icon: Calendar, color: 'from-purple-500 to-indigo-500' },
    { name: 'Pending Requests', value: stats.pendingAppointments, icon: Clock, color: 'from-amber-500 to-orange-500' },
    { name: 'Completed Consults', value: stats.completedAppointments, icon: CheckSquare, color: 'from-emerald-500 to-teal-600' },
  ];

  const maxCount = Math.max(...chartData.map(d => d.count), 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full pointer-events-none translate-x-20 -translate-y-20 blur-xl"></div>
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> System Operational
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-sans">Nirogitanman Management Panel</h2>
          <p className="text-teal-100 text-sm leading-relaxed font-medium">
            Monitor appointments, patient medical history, clinic FAQs, and contact messages in real time.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{card.name}</p>
              <h3 className="text-2xl font-black text-slate-800">{card.value}</h3>
            </div>
            <div className={`p-3 bg-gradient-to-br ${card.color} text-white rounded-xl shadow-sm shrink-0`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Appointment Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">Appointment Statistics</h3>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">Monthly consultation volume over last 6 months</p>
          </div>
          <div className="h-52 flex items-end gap-3 sm:gap-6 pt-4 px-2 border-b border-l border-slate-100 relative">
            {chartData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                <div className="relative w-full flex justify-center">
                  <span className="absolute -top-7 text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.count} appts
                  </span>
                </div>
                <div
                  style={{ height: `${(data.count / maxCount) * 80}%`, minHeight: data.count > 0 ? '6px' : '0px' }}
                  className="w-full max-w-[40px] bg-gradient-to-t from-teal-500 to-emerald-400 rounded-t-lg transition-all duration-500 shadow-sm"
                ></div>
                <span className="text-[10px] font-bold text-slate-400 mt-1">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">Revenue Overview</h3>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">Estimated from completed consultations</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Revenue</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">₹{stats.completedAppointments * 500}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Based on ₹500 per completed consultation.</p>
            </div>
            <div className="border-t border-slate-200/50 pt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{stats.completedAppointments} slots</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Revenue</span>
                <p className="text-sm font-bold text-slate-700 mt-0.5">₹{stats.pendingAppointments * 500}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        {/* Latest Appointments */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Recent Appointments</h3>
            <Link to="/admin/dashboard/appointments" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Patient</th>
                  <th className="pb-3">Doctor</th>
                  <th className="pb-3">Date / Slot</th>
                  <th className="pb-3 pr-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {latestAppts.length > 0 ? (
                  latestAppts.map((appt) => (
                    <tr key={appt._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pl-2 font-semibold text-slate-700">{appt.patientName}</td>
                      <td className="py-3 text-slate-500">{appt.doctor}</td>
                      <td className="py-3 text-slate-500 text-xs">{appt.date}{appt.timeSlot ? ` · ${appt.timeSlot}` : ''}</td>
                      <td className="py-3 pr-2 text-right">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusColor(appt.status)}`}>
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 text-xs">No appointments yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Messages */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Recent Messages</h3>
            <Link to="/admin/dashboard/messages" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {latestMsgs.length > 0 ? (
              latestMsgs.map((msg) => (
                <div key={msg._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{msg.name}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{msg.email}</p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 italic">"{msg.message}"</p>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-slate-400 text-xs">No contact inquiries yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
