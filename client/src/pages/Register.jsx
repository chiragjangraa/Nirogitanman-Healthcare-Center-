import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { Heart, Mail, Phone, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      // Direct registration call
      const res = await usersAPI.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      // Automatically sign in the user
      const loginRes = await login(formData.email, formData.password);
      setLoading(false);
      
      if (loginRes.success) {
        navigate('/profile');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 relative z-10">
        
        {/* Back Link */}
        <div className="-mt-4 -ml-2 mb-4">
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Website
          </Link>
        </div>

        {/* Logo and header */}
        <div className="text-center">
          <div className="mx-auto bg-emerald-500 text-white p-3 rounded-2xl w-fit shadow-md shadow-emerald-100">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800 tracking-tight">Create Account</h2>
          <p className="mt-1.5 text-sm text-slate-500 font-medium">Join Nirogitanman Healthcare Center</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-2.5 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sen"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl pl-10 pr-4 py-3 text-sm transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl pl-10 pr-4 py-3 text-sm transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                required
                placeholder="e.g. +91 99999 88888"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl pl-10 pr-4 py-3 text-sm transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl pl-10 pr-4 py-3 text-sm transition-all"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl pl-10 pr-4 py-3 text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-teal-100 disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4 font-semibold">
          Already have an account? <Link to="/login" className="text-teal-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
