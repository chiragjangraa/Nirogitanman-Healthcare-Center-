import React, { useEffect, useState } from 'react';
import { 
  Users, Activity, Calendar, MessageSquare, 
  BookOpen, Image, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { 
  doctorsAPI, servicesAPI, appointmentsAPI, 
  messagesAPI, blogsAPI, galleryAPI 
} from '../services/api';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    appointments: 0,
    doctors: 0,
    services: 0,
    messages: 0,
    blogs: 0,
    gallery: 0
  });
  const [latestAppts, setLatestAppts] = useState([]);
  const [latestMsgs, setLatestMsgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docs, srvs, appts, msgs, blogs, gals] = await Promise.all([
          doctorsAPI.getAll(),
          servicesAPI.getAll(),
          appointmentsAPI.getAll(),
          messagesAPI.getAll(),
          blogsAPI.getAll(),
          galleryAPI.getAll()
        ]);
        
        setStats({
          doctors: docs.data.length,
          services: srvs.data.length,
          appointments: appts.data.length,
          messages: msgs.data.length,
          blogs: blogs.data.length,
          gallery: gals.data.length
        });

        // Take last 5 items
        setLatestAppts(appts.data.slice(0, 5));
        setLatestMsgs(msgs.data.slice(0, 5));
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
      default: return 'bg-amber-50 text-amber-800 border-amber-200'; // Pending
    }
  };

  const statCards = [
    { name: 'Total Appointments', value: stats.appointments, icon: Calendar, color: 'from-emerald-500 to-teal-600', link: 'appointments' },
    { name: 'Total Doctors', value: stats.doctors, icon: Users, color: 'from-blue-500 to-indigo-600', link: 'doctors' },
    { name: 'Total Services', value: stats.services, icon: Activity, color: 'from-cyan-500 to-teal-500', link: 'services' },
    { name: 'Total Messages', value: stats.messages, icon: MessageSquare, color: 'from-amber-500 to-orange-600', link: 'messages' },
    { name: 'Total Blogs', value: stats.blogs, icon: BookOpen, color: 'from-purple-500 to-indigo-600', link: 'blogs' },
    { name: 'Gallery Images', value: stats.gallery, icon: Image, color: 'from-pink-500 to-rose-600', link: 'gallery' }
  ];

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
          <h2 className="text-2xl sm:text-3xl font-extrabold">Welcome back to Nirogitanman Management Panel</h2>
          <p className="text-teal-100 text-sm leading-relaxed">
            Monitor patient appointments, keep physician directory records up to date, modify healthcare services list, and check patient contact inquiries.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.name}
            to={`/admin/dashboard/${card.link}`}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between group"
          >
            <div className="space-y-1">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{card.name}</p>
              <h3 className="text-3xl font-extrabold text-slate-800">{card.value}</h3>
            </div>
            <div className={`p-4 bg-gradient-to-br ${card.color} text-white rounded-2xl shadow-sm group-hover:scale-105 transition-transform`}>
              <card.icon className="w-6 h-6" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        {/* Latest Appointments */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Recent Appointment Requests</h3>
            <Link to="/admin/dashboard/appointments" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="w-4.5 h-4.5" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Patient</th>
                  <th className="pb-3">Doctor</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 pr-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {latestAppts.length > 0 ? (
                  latestAppts.map((appt) => (
                    <tr key={appt._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-2 font-semibold text-slate-700">{appt.patientName}</td>
                      <td className="py-3.5 text-slate-500">{appt.doctor}</td>
                      <td className="py-3.5 text-slate-500">{appt.date}</td>
                      <td className="py-3.5 pr-2 text-right">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(appt.status)}`}>
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 text-xs">No appointments requested yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Messages */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Recent Contact Messages</h3>
            <Link to="/admin/dashboard/messages" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="w-4.5 h-4.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {latestMsgs.length > 0 ? (
              latestMsgs.map((msg) => (
                <div key={msg._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-all space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{msg.name}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(msg.createdAt).toLocaleDateString()}
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
