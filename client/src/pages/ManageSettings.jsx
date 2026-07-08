import React, { useEffect, useState } from 'react';
import { settingsAPI } from '../services/api';
import { Save, ShieldAlert, CheckCircle } from 'lucide-react';

const ManageSettings = () => {
  const [formData, setFormData] = useState({
    siteName: '',
    email: '',
    phone: '',
    address: '',
    workingHours: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.get();
      if (res.data) {
        setFormData({
          siteName: res.data.siteName || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          workingHours: res.data.workingHours || '',
          socialLinks: {
            facebook: res.data.socialLinks?.facebook || '',
            twitter: res.data.socialLinks?.twitter || '',
            instagram: res.data.socialLinks?.instagram || ''
          }
        });
      }
    } catch (err) {
      console.error('Failed to load clinic settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setSaving(true);

    try {
      const res = await settingsAPI.update(formData);
      setStatus({ type: 'success', message: 'Settings updated successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Clinic Profile & Info Settings</h2>
        <p className="text-slate-500 text-xs sm:text-sm">Modify the clinic name, email, phone number, address, and social links shown on the website footer.</p>
      </div>

      {/* Main Form Settings */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        {status.message && (
          <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {status.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Site Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Website/Center Name</label>
            <input
              type="text"
              required
              value={formData.siteName}
              onChange={(e) => setFormData({...formData, siteName: e.target.value})}
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
            />
          </div>

          {/* Working Hours */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinic Working Hours</label>
            <input
              type="text"
              required
              value={formData.workingHours}
              onChange={(e) => setFormData({...formData, workingHours: e.target.value})}
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Phone Number</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinic Address</label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
          />
        </div>

        {/* Social Links Subheading */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Social Media Profile Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Facebook */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Facebook Link</label>
              <input
                type="text"
                placeholder="https://facebook.com/..."
                value={formData.socialLinks.facebook}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                })}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
              />
            </div>

            {/* Twitter */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Twitter Link</label>
              <input
                type="text"
                placeholder="https://twitter.com/..."
                value={formData.socialLinks.twitter}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                })}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instagram Link</label>
              <input
                type="text"
                placeholder="https://instagram.com/..."
                value={formData.socialLinks.instagram}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                })}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-teal-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4.5 h-4.5" /> {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageSettings;
