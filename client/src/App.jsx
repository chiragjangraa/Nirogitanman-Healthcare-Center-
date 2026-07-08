import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Pages
import Home from './pages/Home';

// User Auth Pages
import Register from './pages/Register';
import UserLogin from './pages/UserLogin';
import Profile from './pages/Profile';

// Admin Pages
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import ManageDoctors from './pages/ManageDoctors';
import ManageServices from './pages/ManageServices';
import ManageAppointments from './pages/ManageAppointments';
import ManageMessages from './pages/ManageMessages';
import ManageBlogs from './pages/ManageBlogs';
import ManageGallery from './pages/ManageGallery';
import ManageSettings from './pages/ManageSettings';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';


function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ================= PUBLIC WEBSITE ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Home initialSection="about" />} />
        <Route path="/services" element={<Home initialSection="services" />} />
        <Route path="/contact" element={<Home initialSection="contact" />} />


        {/* ================= USER AUTH ================= */}
        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<UserLogin />} />

        <Route path="/profile" element={<Profile />} />


        {/* ================= ADMIN LOGIN ================= */}
        <Route path="/admin/login" element={<Login />} />


        {/* ================= ADMIN DASHBOARD ================= */}
        <Route 
          path="/admin/dashboard" 
          element={<ProtectedRoute />}
        >
          <Route element={<DashboardLayout />}>

            <Route 
              index 
              element={<DashboardHome />} 
            />

            <Route 
              path="doctors" 
              element={<ManageDoctors />} 
            />

            <Route 
              path="services" 
              element={<ManageServices />} 
            />

            <Route 
              path="appointments" 
              element={<ManageAppointments />} 
            />

            <Route 
              path="messages" 
              element={<ManageMessages />} 
            />

            <Route 
              path="blogs" 
              element={<ManageBlogs />} 
            />

            <Route 
              path="gallery" 
              element={<ManageGallery />} 
            />

            <Route 
              path="settings" 
              element={<ManageSettings />} 
            />

          </Route>
        </Route>


      </Routes>
    </AuthProvider>
  );
}


export default App;