import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Shield, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + sectionId);
    } else {
      const element = document.getElementById(sectionId.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isHome = location.pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-emerald-500 text-white p-2 rounded-xl group-hover:bg-teal-600 transition-colors shadow-emerald-200 shadow-md">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-teal-800">Nirogitanman</span>
              <span className="block text-[10px] uppercase tracking-widest text-emerald-600 font-semibold -mt-1">Healthcare Center</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isHome ? (
              <>
                <button onClick={() => handleNavClick('#home')} className="text-slate-600 hover:text-emerald-500 font-medium transition-colors cursor-pointer">Home</button>
                <button onClick={() => handleNavClick('#about')} className="text-slate-600 hover:text-emerald-500 font-medium transition-colors cursor-pointer">About</button>
                <button onClick={() => handleNavClick('#services')} className="text-slate-600 hover:text-emerald-500 font-medium transition-colors cursor-pointer">Services</button>
                <button onClick={() => handleNavClick('#doctors')} className="text-slate-600 hover:text-emerald-500 font-medium transition-colors cursor-pointer">Doctors</button>
                <button onClick={() => handleNavClick('#contact')} className="text-slate-600 hover:text-emerald-500 font-medium transition-colors cursor-pointer">Contact</button>
              </>
            ) : (
              <>
                <Link to="/" className="text-slate-600 hover:text-emerald-500 font-medium transition-colors">Home</Link>
                <Link to="/#about" className="text-slate-600 hover:text-emerald-500 font-medium transition-colors">About</Link>
                <Link to="/#services" className="text-slate-600 hover:text-emerald-500 font-medium transition-colors">Services</Link>
                <Link to="/#doctors" className="text-slate-600 hover:text-emerald-500 font-medium transition-colors">Doctors</Link>
                <Link to="/#contact" className="text-slate-600 hover:text-emerald-500 font-medium transition-colors">Contact</Link>
              </>
            )}

            {user ? (
              user.role === 'admin' ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-xl font-semibold transition-all border border-emerald-200"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-slate-600 hover:text-rose-600 px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 px-4 py-2 rounded-xl font-semibold transition-all border border-teal-200"
                  >
                    <User className="w-4 h-4" />
                    {user.name.split(' ')[0]}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-slate-600 hover:text-rose-600 px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              )
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-xl font-semibold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-xl font-semibold transition-colors"
                >
                  Register
                </Link>
              </>
            )}

            <button
              onClick={() => handleNavClick('#contact')}
              className="bg-teal-600 text-white hover:bg-teal-700 hover:scale-102 active:scale-98 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-teal-100 cursor-pointer"
            >
              Book Appointment
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-teal-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg border-t border-slate-100 mt-3 absolute w-full left-0 py-4 px-4 space-y-3">
          {isHome ? (
            <>
              <button onClick={() => handleNavClick('#home')} className="block w-full text-left py-2 px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium cursor-pointer">Home</button>
              <button onClick={() => handleNavClick('#about')} className="block w-full text-left py-2 px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium cursor-pointer">About</button>
              <button onClick={() => handleNavClick('#services')} className="block w-full text-left py-2 px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium cursor-pointer">Services</button>
              <button onClick={() => handleNavClick('#doctors')} className="block w-full text-left py-2 px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium cursor-pointer">Doctors</button>
              <button onClick={() => handleNavClick('#contact')} className="block w-full text-left py-2 px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium cursor-pointer">Contact</button>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium">Home</Link>
              <Link to="/#about" onClick={() => setIsOpen(false)} className="block py-2 px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium">About</Link>
              <Link to="/#services" onClick={() => setIsOpen(false)} className="block py-2 px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium">Services</Link>
              <Link to="/#doctors" onClick={() => setIsOpen(false)} className="block py-2 px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium">Doctors</Link>
              <Link to="/#contact" onClick={() => setIsOpen(false)} className="block py-2 px-3 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium">Contact</Link>
            </>
          )}

          <div className="border-t border-slate-100 my-2 pt-2 space-y-2">
            {user ? (
              user.role === 'admin' ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard Panel
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="flex items-center gap-2 w-full text-left py-2 px-3 text-rose-600 hover:bg-rose-50 rounded-lg font-medium cursor-pointer"
                  >
                    Logout Admin
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 py-2 px-3 text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg font-semibold"
                  >
                    <User className="w-4 h-4" />
                    My Profile ({user.name.split(' ')[0]})
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="flex items-center gap-2 w-full text-left py-2 px-3 text-rose-600 hover:bg-rose-50 rounded-lg font-medium cursor-pointer"
                  >
                    Logout Account
                  </button>
                </>
              )
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold"
                >
                  Login Account
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold"
                >
                  Register Account
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => handleNavClick('#contact')}
            className="block w-full bg-teal-600 text-white text-center py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors shadow-md shadow-teal-100"
          >
            Book Appointment
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
