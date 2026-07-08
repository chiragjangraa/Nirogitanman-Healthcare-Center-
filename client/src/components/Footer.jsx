import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { settingsAPI } from '../services/api';

const Footer = () => {
  const [settings, setSettings] = useState({
    siteName: 'Nirogitanman Healthcare',
    email: 'contact@nirogitanman.com',
    phone: '+91 98765 43210',
    address: '123, Wellness Enclave, Health City, Sector 5, New Delhi - 110001',
    workingHours: 'Mon - Sat: 8:00 AM - 8:00 PM, Sun: Emergency Only',
    socialLinks: { facebook: '#', twitter: '#', instagram: '#' }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsAPI.get();
        if (res.data) setSettings(res.data);
      } catch (err) {
        console.warn('Could not fetch settings in footer, using defaults');
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-emerald-500 text-white p-2 rounded-xl">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Nirogitanman</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Providing modern, compassionate, and premium healthcare services to ensure the well-being of you and your family. Your health is our priority.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href={settings.socialLinks?.facebook || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors p-2 bg-slate-800 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a href={settings.socialLinks?.twitter || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors p-2 bg-slate-800 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={settings.socialLinks?.instagram || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors p-2 bg-slate-800 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wider uppercase text-xs">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#home" className="hover:text-emerald-400 transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#services" className="hover:text-emerald-400 transition-colors">Our Services</a></li>
              <li><a href="#doctors" className="hover:text-emerald-400 transition-colors">Our Doctors</a></li>
              <li><a href="#contact" className="hover:text-emerald-400 transition-colors">Book Appointment</a></li>
            </ul>
          </div>

          {/* Clinic Hours */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wider uppercase text-xs">Clinic Hours</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-300 font-medium">Opening Hours:</p>
                  <p className="text-slate-400 text-xs mt-0.5">{settings.workingHours}</p>
                </div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-800 text-xs">
                <span className="text-amber-400 font-semibold block mb-0.5">Emergency Care:</span>
                Our emergency and trauma services are open 24 hours a day, 7 days a week.
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wider uppercase text-xs">Contact Details</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                <span className="text-slate-400 text-xs leading-relaxed">{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-slate-400 text-xs">{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-slate-400 text-xs">{settings.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {settings.siteName}. All Rights Reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
