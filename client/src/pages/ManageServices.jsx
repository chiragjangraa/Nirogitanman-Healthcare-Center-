import React, { useEffect, useState } from 'react';
import { servicesAPI } from '../services/api';
import { Plus, Edit2, Trash2, X, Search, ShieldAlert, Activity } from 'lucide-react';

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSrv, setEditingSrv] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await servicesAPI.getAll();
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load services list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSrv(null);
    setFormData({ title: '', description: '', image: '' });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setEditingSrv(srv);
    setFormData({
      title: srv.title,
      description: srv.description,
      image: srv.image
    });
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await servicesAPI.delete(id);
      setServices(services.filter(s => s._id !== id));
    } catch (err) {
      alert('Failed to delete service: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingSrv) {
        const res = await servicesAPI.update(editingSrv._id, formData);
        setServices(services.map(s => s._id === editingSrv._id ? res.data : s));
      } else {
        const res = await servicesAPI.create(formData);
        setServices([res.data, ...services]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const filteredServices = services.filter(srv =>
    srv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manage Clinic Services</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Manage the list of healthcare services displayed on Nirogitanman landing page.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-100 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4.5 h-4.5" /> Add Service
        </button>
      </div>

      {/* Controls & Search */}
      <div className="flex bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search services by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-sm focus:outline-none text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* Listing Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => (
            <div key={srv._id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
              <div>
                <div className="h-48 overflow-hidden bg-slate-50 relative">
                  <img src={srv.image} alt={srv.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-3 left-3 bg-emerald-600 text-white p-2 rounded-xl">
                    <Activity className="w-4.5 h-4.5" />
                  </span>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="font-extrabold text-slate-800 text-base group-hover:text-teal-600 transition-colors">{srv.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-4">{srv.description}</p>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button
                  onClick={() => handleOpenEdit(srv)}
                  className="flex-1 flex justify-center items-center gap-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 py-2 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-teal-200"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(srv._id)}
                  className="flex-1 flex justify-center items-center gap-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 py-2 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-sm">No services found matching search criteria.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingSrv ? 'Edit Service Details' : 'Add New Service'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-200 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiac Care"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Image URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com/service-banner.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Explain details about the service treatment, diagnostics, and processes..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-md shadow-teal-100 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;
