import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Calendar, Clock, Phone, MapPin, Award, CheckCircle, 
  ChevronRight, Star, Send, ShieldAlert, ArrowRight, Activity, Users 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { doctorsAPI, servicesAPI, appointmentsAPI, messagesAPI, galleryAPI } from '../services/api';

const Home = ({ initialSection }) => {
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);
  
  // Appointment Form State
  const [apptForm, setApptForm] = useState({
    patientName: '',
    phone: '',
    email: '',
    doctor: '',
    date: ''
  });
  const [apptStatus, setApptStatus] = useState({ type: '', message: '' });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [contactStatus, setContactStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    // Scroll to initial section if specified
    if (initialSection) {
      const element = document.getElementById(initialSection);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [initialSection]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, srvsRes, galRes] = await Promise.all([
          doctorsAPI.getAll(),
          servicesAPI.getAll(),
          galleryAPI.getAll()
        ]);
        setDoctors(docsRes.data);
        setServices(srvsRes.data);
        setGallery(galRes.data);
      } catch (err) {
        console.error('Error fetching public page data:', err);
      }
    };
    fetchData();
  }, []);

  const handleApptSubmit = async (e) => {
    e.preventDefault();
    setApptStatus({ type: 'loading', message: 'Submitting your request...' });
    try {
      await appointmentsAPI.create(apptForm);
      setApptStatus({ type: 'success', message: 'Appointment requested successfully! We will contact you soon.' });
      setApptForm({ patientName: '', phone: '', email: '', doctor: '', date: '' });
    } catch (err) {
      setApptStatus({ type: 'error', message: err.response?.data?.message || 'Something went wrong. Please try again.' });
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ type: 'loading', message: 'Sending message...' });
    try {
      await messagesAPI.create(contactForm);
      setContactStatus({ type: 'success', message: 'Message sent successfully! We will get back to you shortly.' });
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      setContactStatus({ type: 'error', message: err.response?.data?.message || 'Something went wrong. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-radial-gradient from-teal-100/40 to-transparent pointer-events-none rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
              >
                <Award className="w-4 h-4" /> Trusted Healthcare Service Provider
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 leading-tight"
              >
                Complete Medical <br className="hidden sm:inline" />
                <span className="text-teal-600 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Solutions For Your Health</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                At Nirogitanman Healthcare, we offer state-of-the-art medical treatments combined with compassionate clinical care. Our expert doctors are here to support your wellness journey.
              </motion.p>
              
              {/* CTAs */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2"
              >
                <a
                  href="#contact"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-emerald-100 hover:shadow-xl transition-all flex items-center justify-center gap-2 text-center"
                >
                  Book Appointment <Calendar className="w-5 h-5" />
                </a>
                <a
                  href="#services"
                  className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-8 py-4 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 text-center"
                >
                  Explore Services <ArrowRight className="w-5 h-5 text-slate-400" />
                </a>
              </motion.div>
            </div>

            {/* Hero Image / Widget */}
            <div className="lg:col-span-5 relative flex justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-[400px] aspect-[4/5] bg-emerald-500 rounded-3xl overflow-hidden shadow-2xl group border-4 border-white"
              >
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600" 
                  alt="Doctor" 
                  className="w-full h-full object-cover grayscale-20 brightness-95"
                />
                
                {/* Floating Widget */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex items-center gap-4 animate-bounce-slow">
                  <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 shrink-0">
                    <Activity className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Online Consultations</h4>
                    <p className="text-slate-500 text-xs mt-0.5">Top-tier doctors, 24/7 live assistance</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Banner Section */}
      <section className="bg-white py-12 border-y border-slate-100 relative z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 md:p-0 md:pl-6 first:pl-0">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><Phone className="w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Emergency Call</h3>
                <p className="text-slate-500 text-sm mt-1 font-semibold">+91 98765 43210</p>
                <p className="text-slate-400 text-xs mt-0.5">24/7 Emergency response team</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 md:p-0 md:pl-6">
              <div className="bg-teal-50 text-teal-600 p-3 rounded-xl"><Clock className="w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Working Hours</h3>
                <p className="text-slate-500 text-sm mt-1">Mon - Sat: 8 AM - 8 PM</p>
                <p className="text-slate-400 text-xs mt-0.5">Sunday: Emergency trauma only</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 md:p-0 md:pl-6">
              <div className="bg-sky-50 text-sky-600 p-3 rounded-xl"><MapPin className="w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Our Location</h3>
                <p className="text-slate-500 text-sm mt-1 truncate max-w-[250px]">Sector 5, New Delhi</p>
                <p className="text-slate-400 text-xs mt-0.5">123, Wellness Enclave, Health City</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Images layout */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 rounded-2xl overflow-hidden shadow-md">
                  <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400" alt="Hospital Room" className="w-full h-full object-cover" />
                </div>
                <div className="h-44 bg-teal-500 rounded-2xl flex flex-col justify-center items-center text-white p-6 shadow-md text-center">
                  <span className="text-4xl font-extrabold">15+</span>
                  <span className="text-sm font-semibold tracking-wider uppercase mt-1">Years Experience</span>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-44 bg-emerald-600 rounded-2xl flex flex-col justify-center items-center text-white p-6 shadow-md text-center">
                  <span className="text-4xl font-extrabold">10k+</span>
                  <span className="text-sm font-semibold tracking-wider uppercase mt-1">Happy Patients</span>
                </div>
                <div className="h-64 rounded-2xl overflow-hidden shadow-md">
                  <img src="https://images.unsplash.com/photo-1584515901387-a7f18e26524b?auto=format&fit=crop&q=80&w=400" alt="Consultation" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Description Text */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-block bg-teal-50 text-teal-800 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                Who We Are
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                Pioneering Exceptional Care & Professional Medical Solutions
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Nirogitanman Healthcare is committed to delivering world-class, integrated healthcare services. With a highly qualified team of specialist doctors and modern medical infrastructures, we ensure you receive the safest, most reliable care possible.
              </p>
              
              {/* Bullet checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">Expert Specialist Doctors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">24/7 Emergency Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">Modern Diagnostic Labs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">Premium Inpatient Care</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
                <div className="flex -space-x-3">
                  <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=80" className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="Dr1" />
                  <img src="https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=80" className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="Dr2" />
                  <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=80" className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="Dr3" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-800">100+ Professional Staff</p>
                  <p className="text-slate-500">Always ready to support your health requirements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-block bg-emerald-50 text-emerald-800 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Our Core Services
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
              Outstanding Services for Your Best Health
            </h2>
            <p className="text-slate-500 text-sm">
              We offer a wide range of medical specialties and support systems, customized to meet individual patient needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.length > 0 ? (
              services.map((srv, idx) => (
                <div key={srv._id || idx} className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="h-48 overflow-hidden relative">
                    <img src={srv.image} alt={srv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-teal-600 text-white p-2 rounded-xl">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-teal-600 transition-colors">{srv.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{srv.description}</p>
                    <a href="#contact" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 pt-2 cursor-pointer">
                      Book Service <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              // Fallback cards if empty
              [
                { title: 'General Medicine', desc: 'Routine diagnoses, health assessments, treatment planning, and medication consulting.', img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400' },
                { title: 'Cardiac Wellness', desc: 'Complete heart screenings, ECG evaluations, echocardiograms, and specialist cardiology consulting.', img: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=400' },
                { title: 'Pediatric Care', desc: 'Comprehensive children physical checkups, immunization, developmental checks, and pediatrics coaching.', img: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=400' }
              ].map((srv, idx) => (
                <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="h-48 overflow-hidden relative">
                    <img src={srv.img} alt={srv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-teal-600 text-white p-2 rounded-xl">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-teal-600 transition-colors">{srv.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{srv.desc}</p>
                    <a href="#contact" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 pt-2 cursor-pointer">
                      Book Service <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-block bg-teal-50 text-teal-800 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Health Packages & Programs
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
              Wellness Packages & Preventive Care Programs
            </h2>
            <p className="text-slate-500 text-sm">
              Invest in your future with our standard health screening packages tailored for individuals and families.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Program 1 */}
            <div className="border border-slate-100 bg-slate-50/50 hover:bg-white rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all border-t-4 border-t-emerald-500 group">
              <div className="space-y-4">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Basic Screen</span>
                <h3 className="font-extrabold text-slate-800 text-xl">General Health Checkup</h3>
                <p className="text-slate-500 text-sm">Perfect for routine diagnostics and general screening.</p>
                <div className="text-3xl font-black text-slate-800 pt-2">₹1,499 <span className="text-sm font-normal text-slate-400">/ Session</span></div>
                
                <ul className="space-y-2 pt-4 border-t border-slate-200 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Full blood count check</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Blood sugar & lipid profile</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> BMI & body composition analysis</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Doctor consultation & report review</li>
                </ul>
              </div>
              <a href="#contact" className="mt-8 block bg-slate-800 hover:bg-emerald-600 text-white text-center font-semibold py-3 rounded-xl transition-all shadow-md group-hover:scale-102">
                Buy Package
              </a>
            </div>

            {/* Program 2 */}
            <div className="border border-teal-200 bg-white rounded-2xl p-8 flex flex-col justify-between shadow-md relative overflow-hidden transform md:-translate-y-2 border-t-4 border-t-teal-500">
              <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-4 rounded-bl-xl shadow-sm">
                Most Popular
              </div>
              <div className="space-y-4">
                <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Advanced Screen</span>
                <h3 className="font-extrabold text-slate-800 text-xl">Cardiac & Diabetic Care</h3>
                <p className="text-slate-500 text-sm">Tailored for cardiovascular and thyroid assessments.</p>
                <div className="text-3xl font-black text-slate-800 pt-2">₹2,999 <span className="text-sm font-normal text-slate-400">/ Session</span></div>
                
                <ul className="space-y-2 pt-4 border-t border-teal-100 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500 shrink-0" /> Complete basic checks</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500 shrink-0" /> ECG & HbA1c tests</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500 shrink-0" /> Renal & liver function profiles</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500 shrink-0" /> Senior Cardiologist consultation</li>
                </ul>
              </div>
              <a href="#contact" className="mt-8 block bg-teal-600 hover:bg-teal-700 text-white text-center font-semibold py-3 rounded-xl transition-all shadow-md shadow-teal-100 hover:scale-102">
                Buy Package
              </a>
            </div>

            {/* Program 3 */}
            <div className="border border-slate-100 bg-slate-50/50 hover:bg-white rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all border-t-4 border-t-emerald-500 group">
              <div className="space-y-4">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Complete Screen</span>
                <h3 className="font-extrabold text-slate-800 text-xl">Comprehensive Executive Package</h3>
                <p className="text-slate-500 text-sm">Our most exhaustive wellness evaluation program.</p>
                <div className="text-3xl font-black text-slate-800 pt-2">₹4,999 <span className="text-sm font-normal text-slate-400">/ Session</span></div>
                
                <ul className="space-y-2 pt-4 border-t border-slate-200 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Advanced package contents</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Thyroid profile & vitamin levels</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Chest X-Ray & Ultrasound (Abdomen)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Multi-specialist consultation</li>
                </ul>
              </div>
              <a href="#contact" className="mt-8 block bg-slate-800 hover:bg-emerald-600 text-white text-center font-semibold py-3 rounded-xl transition-all shadow-md group-hover:scale-102">
                Buy Package
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-block bg-emerald-50 text-emerald-800 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Meet Our Specialist Doctors
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
              Highly Qualified Medical Specialists
            </h2>
            <p className="text-slate-500 text-sm">
              Our specialists are recognized experts in their respective disciplines, committed to delivering clinical excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.length > 0 ? (
              doctors.map((doc, idx) => (
                <div key={doc._id || idx} className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="h-64 overflow-hidden relative">
                      <img src={doc.image} alt={doc.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 object-top" />
                      <div className="absolute bottom-4 left-4 bg-teal-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">
                        {doc.specialization}
                      </div>
                    </div>
                    <div className="p-6 space-y-2">
                      <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-teal-600 transition-colors">{doc.name}</h3>
                      <p className="text-emerald-600 text-xs font-bold">{doc.qualification}</p>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{doc.description}</p>
                    </div>
                  </div>
                  <div className="p-6 border-t border-slate-100">
                    <a
                      href="#contact"
                      onClick={() => setApptForm(prev => ({ ...prev, doctor: doc.name }))}
                      className="block bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-center text-xs font-bold py-2.5 rounded-xl transition-all"
                    >
                      Book Appointment
                    </a>
                  </div>
                </div>
              ))
            ) : (
              // Fallback doctors
              [
                { name: 'Dr. Alok Sharma', specialization: 'Cardiology', qualification: 'MD, DM (Cardiology)', desc: 'Expert in interventional cardiology, heart failure management, and preventive cardiac care.', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' },
                { name: 'Dr. Priya Patel', specialization: 'Pediatrics', qualification: 'MBBS, MD (Pediatrics)', desc: 'Dedicated to providing compassionate care for infants, children, and adolescents.', img: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400' },
                { name: 'Dr. Rajesh Verma', specialization: 'Orthopedics', qualification: 'MS (Ortho), MCh (Ortho)', desc: 'Specialist in joint replacements, sports injuries, and advanced arthroscopic surgeries.', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400' }
              ].map((doc, idx) => (
                <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="h-64 overflow-hidden relative">
                      <img src={doc.img} alt={doc.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 object-top" />
                      <div className="absolute bottom-4 left-4 bg-teal-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">
                        {doc.specialization}
                      </div>
                    </div>
                    <div className="p-6 space-y-2">
                      <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-teal-600 transition-colors">{doc.name}</h3>
                      <p className="text-emerald-600 text-xs font-bold">{doc.qualification}</p>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{doc.desc}</p>
                    </div>
                  </div>
                  <div className="p-6 border-t border-slate-100">
                    <a
                      href="#contact"
                      onClick={() => setApptForm(prev => ({ ...prev, doctor: doc.name }))}
                      className="block bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-center text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Book Appointment
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-block bg-teal-50 text-teal-800 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Patient Reviews
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
              What Our Patients Say About Us
            </h2>
            <p className="text-slate-500 text-sm">
              Nothing motivates us more than hearing from our patients about their experiences and successful treatment paths.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sanjay Mishra', role: 'Business Owner', review: 'Nirogitanman Healthcare provided outstanding care when I had my bypass surgery. Dr. Alok and his staff were highly supportive throughout my recovery.', rating: 5, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
              { name: 'Kirti Sen', role: 'Teacher', review: 'My child was suffering from asthma and we had been to multiple clinics. The pediatrician here diagnosed the issue quickly and custom-built a treatment plan.', rating: 5, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
              { name: 'Amit Goel', role: 'Software Engineer', review: 'Extremely clean environment and very professional processes. Booking appointments online was very straightforward and I barely had to wait.', rating: 4, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' }
            ].map((t, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm relative space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 fill-current ${i < t.rating ? 'text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-slate-600 text-sm italic leading-relaxed">"{t.review}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{t.name}</h4>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-block bg-emerald-50 text-emerald-800 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Hospital Tour
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
              Gallery & Infrastructure Facilities
            </h2>
            <p className="text-slate-500 text-sm">
              A glimpse into our modern equipment, specialized laboratory rooms, ICU units, and reception lounges.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gallery.length > 0 ? (
              gallery.map((img, idx) => (
                <div key={img._id || idx} className="h-60 rounded-2xl overflow-hidden shadow-md group relative">
                  <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm font-semibold">{img.title}</p>
                  </div>
                </div>
              ))
            ) : (
              // Fallback gallery images
              [
                { title: 'Advanced MRI Scanner', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400' },
                { title: 'ICU Ward Room', url: 'https://images.unsplash.com/photo-1584515901387-a7f18e26524b?auto=format&fit=crop&q=80&w=400' },
                { title: 'Inpatient Room layout', url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=400' },
                { title: 'Outpatient Lounge', url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400' }
              ].map((img, idx) => (
                <div key={idx} className="h-60 rounded-2xl overflow-hidden shadow-md group relative">
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm font-semibold">{img.title}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contact & Booking Section */}
      <section id="contact" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Appointment Booking Form */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-100 rounded-3xl p-8 shadow-md">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Book an Appointment Request</h3>
              <p className="text-slate-500 text-xs sm:text-sm mb-6">Complete this online form and our clinical coordinator will call to confirm your scheduled slot.</p>
              
              {apptStatus.message && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${
                  apptStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                  apptStatus.type === 'loading' ? 'bg-slate-100 text-slate-700' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {apptStatus.message}
                </div>
              )}

              <form onSubmit={handleApptSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sen"
                      value={apptForm.patientName}
                      onChange={(e) => setApptForm({...apptForm, patientName: e.target.value})}
                      className="w-full bg-white border border-slate-200 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 99999 88888"
                      value={apptForm.phone}
                      onChange={(e) => setApptForm({...apptForm, phone: e.target.value})}
                      className="w-full bg-white border border-slate-200 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={apptForm.email}
                    onChange={(e) => setApptForm({...apptForm, email: e.target.value})}
                    className="w-full bg-white border border-slate-200 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Choose Doctor</label>
                    <select
                      required
                      value={apptForm.doctor}
                      onChange={(e) => setApptForm({...apptForm, doctor: e.target.value})}
                      className="w-full bg-white border border-slate-200 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-3 text-sm transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Doctor</option>
                      {doctors.length > 0 ? (
                        doctors.map((d) => <option key={d._id} value={d.name}>{d.name} ({d.specialization})</option>)
                      ) : (
                        <>
                          <option value="Dr. Alok Sharma">Dr. Alok Sharma (Cardiology)</option>
                          <option value="Dr. Priya Patel">Dr. Priya Patel (Pediatrics)</option>
                          <option value="Dr. Rajesh Verma">Dr. Rajesh Verma (Orthopedics)</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={apptForm.date}
                      onChange={(e) => setApptForm({...apptForm, date: e.target.value})}
                      className="w-full bg-white border border-slate-200 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-3 text-sm transition-all cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={apptStatus.type === 'loading'}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-teal-100 disabled:opacity-50 mt-4 cursor-pointer"
                >
                  {apptStatus.type === 'loading' ? 'Submitting...' : 'Confirm Appointment Request'}
                </button>
              </form>
            </div>

            {/* Quick Contact Form */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-800">Quick Contact Inquiry</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Have questions about our doctors, clinic facilities, or treatments? Send us a quick query message and our help desk team will email you back.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm">
                {contactStatus.message && (
                  <div className={`p-4 rounded-xl mb-4 text-sm font-medium ${
                    contactStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    contactStatus.type === 'loading' ? 'bg-slate-100 text-slate-700' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {contactStatus.message}
                  </div>
                )}
                
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full bg-white border border-slate-200 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      type="email"
                      required
                      placeholder="Your Email Address"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full bg-white border border-slate-200 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <textarea
                      required
                      rows="4"
                      placeholder="Your Message/Inquiry"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      className="w-full bg-white border border-slate-200 focus:border-teal-500 focus:outline-none rounded-xl px-4 py-3 text-sm transition-all resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={contactStatus.type === 'loading'}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Send Inquiry <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
