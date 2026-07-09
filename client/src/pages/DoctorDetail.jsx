import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Award, Clock, ArrowLeft, Heart, Calendar, CheckCircle2, XCircle } from 'lucide-react';

const DoctorDetail = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await doctorsAPI.getById(id);
        setDoctor(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Doctor not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl max-w-md text-center border border-red-200 shadow-md">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Doctor Profile Unavailable</h3>
            <p className="text-sm mb-4">{error || 'Unable to retrieve details.'}</p>
            <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Doctors Directory
          </Link>
        </div>

        {/* Doctor Details Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8">
          
          {/* Doctor Image & Quick Stats */}
          <div className="md:col-span-5 space-y-6">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner relative">
              <img 
                src={doctor.image} 
                alt={doctor.name} 
                className="w-full h-full object-cover object-top"
              />
              <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${
                doctor.status === 'Available' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {doctor.status}
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-teal-100 text-teal-700 p-2.5 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                  <p className="text-sm font-bold text-slate-700">{doctor.experienceYears} Years Clinical Work</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Availability</p>
                  <p className="text-sm font-bold text-slate-700">Available For Consultations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Info & Timings */}
          <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="inline-block bg-teal-50 text-teal-800 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {doctor.specialization}
                </span>
                <h1 className="text-3xl font-extrabold text-slate-800 mt-3">{doctor.name}</h1>
                <p className="text-emerald-600 font-bold text-sm mt-1">{doctor.qualification}</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Professional Profile</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {doctor.description}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Consultation Timings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {doctor.availableTimings && doctor.availableTimings.length > 0 ? (
                    doctor.availableTimings.map((time, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-semibold text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{time}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs">No active timings scheduled.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Trigger */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Consultation Booking</p>
                <p className="text-xs text-slate-500 mt-0.5">Quick booking slots are available for this week</p>
              </div>
              {doctor.status === 'Available' ? (
                <Link
                  to={`/#contact`}
                  state={{ preselectedDoctor: doctor.name }}
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-teal-100 transition-all text-center flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" /> Book Appointment Slot
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full sm:w-auto bg-slate-200 text-slate-400 font-bold px-8 py-3.5 rounded-xl cursor-not-allowed text-center"
                >
                  Unavailable for Bookings
                </button>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorDetail;
