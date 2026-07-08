import React, { useEffect, useState } from 'react';
import { galleryAPI } from '../services/api';
import { Plus, Trash2, X, Search, ShieldAlert, Image } from 'lucide-react';

const ManageGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await galleryAPI.getAll();
      setGallery(res.data);
    } catch (err) {
      console.error('Failed to load gallery items', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ title: '', imageUrl: '' });
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this image from the gallery?')) return;
    try {
      await galleryAPI.delete(id);
      setGallery(gallery.filter(g => g._id !== id));
    } catch (err) {
      alert('Failed to delete image: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await galleryAPI.create(formData);
      setGallery([res.data, ...gallery]);
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add image to gallery.');
    } finally {
      setSaving(false);
    }
  };

  const filteredGallery = gallery.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manage Infrastructure Gallery</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Manage the photos displayed in the tour gallery section on the landing page.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-100 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4.5 h-4.5" /> Add Image
        </button>
      </div>

      {/* Controls & Search */}
      <div className="flex bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search gallery photos by title..."
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
      ) : filteredGallery.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGallery.map((item) => (
            <div key={item._id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group relative">
              <div className="h-52 bg-slate-50 relative overflow-hidden">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                
                {/* Delete button hover overlay */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(item._id)}
                    title="Delete Image"
                    className="bg-white/90 hover:bg-rose-600 hover:text-white text-rose-600 p-3 rounded-2xl shadow-md transition-all cursor-pointer transform scale-90 group-hover:scale-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <h4 className="font-bold text-slate-700 text-xs sm:text-sm truncate">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-sm">No gallery items found matching search criteria.</p>
        </div>
      )}

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Add Image to Gallery</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-200 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Photo Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern ICU Ward"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Photo Image URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com/gallery-photo.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                />
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
                  {saving ? 'Adding...' : 'Add Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGallery;
