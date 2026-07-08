import React, { useEffect, useState } from 'react';
import { blogsAPI } from '../services/api';
import { Plus, Edit2, Trash2, X, Search, ShieldAlert, BookOpen } from 'lucide-react';

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    author: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await blogsAPI.getAll();
      setBlogs(res.data);
    } catch (err) {
      console.error('Failed to load blogs list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setFormData({ title: '', content: '', image: '', author: 'Nirogitanman Team' });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      image: blog.image,
      author: blog.author
    });
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await blogsAPI.delete(id);
      setBlogs(blogs.filter(b => b._id !== id));
    } catch (err) {
      alert('Failed to delete blog: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingBlog) {
        const res = await blogsAPI.update(editingBlog._id, formData);
        setBlogs(blogs.map(b => b._id === editingBlog._id ? res.data : b));
      } else {
        const res = await blogsAPI.create(formData);
        setBlogs([res.data, ...blogs]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save blog post.');
    } finally {
      setSaving(false);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manage Blog Posts</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Write, modify, or delete health tips and announcements articles.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-100 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4.5 h-4.5" /> Create Blog Post
        </button>
      </div>

      {/* Controls & Search */}
      <div className="flex bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by article title or author..."
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
      ) : filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBlogs.map((blog) => (
            <div key={blog._id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
              <div>
                <div className="h-56 overflow-hidden bg-slate-50 relative">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-3 left-3 bg-teal-600 text-white p-2 rounded-xl">
                    <BookOpen className="w-4.5 h-4.5" />
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                    By {blog.author}
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-teal-600 transition-colors leading-snug">{blog.title}</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-4">{blog.content}</p>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button
                  onClick={() => handleOpenEdit(blog)}
                  className="flex-1 flex justify-center items-center gap-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 py-2 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-teal-200"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Post
                </button>
                <button
                  onClick={() => handleDelete(blog._id)}
                  className="flex-1 flex justify-center items-center gap-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 py-2 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-sm">No blog posts found matching search criteria.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingBlog ? 'Edit Blog Article' : 'Write New Blog Article'}
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Article Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Tips to Keep Your Heart Healthy"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Author Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alok Sharma"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Featured Image URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://example.com/blog-banner.jpg"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Article Body Content</label>
                <textarea
                  required
                  rows="8"
                  placeholder="Compose your blog article body details here..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
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
                  {saving ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlogs;
