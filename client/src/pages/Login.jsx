import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginAdmin(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative blobs */}
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
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800 tracking-tight">Admin Portal</h2>
          <p className="mt-1.5 text-sm text-slate-500 font-medium">Nirogitanman Healthcare Center</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-2.5 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                placeholder="admin@nirogitanman.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl pl-10 pr-4 py-3.5 text-sm transition-all"
              />
            </div>
          </div>

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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl pl-10 pr-4 py-3.5 text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-teal-100 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
