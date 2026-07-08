import React, { useEffect, useState } from 'react';
import { doctorsAPI } from '../services/api';
import { Plus, Edit2, Trash2, X, Search, ShieldAlert } from 'lucide-react';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualification: '',
    image: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await doctorsAPI.getAll();
      setDoctors(res.data);
    } catch (err) {
      console.error('Failed to load doctors list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setFormData({ name: '', specialization: '', qualification: '', image: '', description: '' });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingDoc(doc);
    setFormData({
      name: doc.name,
      specialization: doc.specialization,
      qualification: doc.qualification,
      image: doc.image,
      description: doc.description
    });
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor?')) return;
    try {
      await doctorsAPI.delete(id);
      setDoctors(doctors.filter(d => d._id !== id));
    } catch (err) {
      alert('Failed to delete doctor: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingDoc) {
        const res = await doctorsAPI.update(editingDoc._id, formData);
        setDoctors(doctors.map(d => d._id === editingDoc._id ? res.data : d));
      } else {
        const res = await doctorsAPI.create(formData);
        setDoctors([res.data, ...doctors]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save doctor.');
    } finally {
      setSaving(false);
    }
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manage Doctors Directory</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Add, modify, or remove doctors representing Nirogitanman Healthcare.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-100 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4.5 h-4.5" /> Add Doctor
        </button>
      </div>

      {/* Controls & Search */}
      <div className="flex bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by doctor name or specialization..."
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
      ) : filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div key={doc._id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="h-48 overflow-hidden bg-slate-50 relative">
                  <img src={doc.image} alt={doc.name} className="w-full h-full object-cover object-top" />
                  <span className="absolute bottom-3 left-3 bg-teal-600 text-white text-[10px] uppercase font-bold py-1 px-2.5 rounded-lg">
                    {doc.specialization}
                  </span>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="font-extrabold text-slate-800 text-base">{doc.name}</h3>
                  <p className="text-emerald-600 text-xs font-bold">{doc.qualification}</p>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{doc.description}</p>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button
                  onClick={() => handleOpenEdit(doc)}
                  className="flex-1 flex justify-center items-center gap-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 py-2 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-teal-200"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(doc._id)}
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
          <p className="text-slate-400 text-sm">No doctors found matching search criteria.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingDoc ? 'Edit Doctor Profile' : 'Add New Doctor Profile'}
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Alok Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardiology"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qualification</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MD, DM (Cardiology)"
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Image URL (or Base64)</label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com/doctor-photo.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description/Bio</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Enter details about physician credentials, experience, and background..."
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
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;
