import React, { useEffect, useState } from 'react';
import { messagesAPI } from '../services/api';
import { Trash2, Search, Mail, MessageSquare, Clock } from 'lucide-react';

const ManageMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await messagesAPI.getAll();
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await messagesAPI.delete(id);
      setMessages(messages.filter(m => m._id !== id));
    } catch (err) {
      alert('Failed to delete message: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Contact Messages</h2>
        <p className="text-slate-500 text-xs sm:text-sm">Manage inquiry messages sent by patients via the website's contact forms.</p>
      </div>

      {/* Controls & Search */}
      <div className="flex bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by sender name, email, or message contents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-sm focus:outline-none text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* Listing View */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredMessages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMessages.map((msg) => (
            <div key={msg._id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Sender Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-teal-50 text-teal-600 p-2.5 rounded-xl border border-teal-100 shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-base leading-tight">{msg.name}</h4>
                      <a href={`mailto:${msg.email}`} className="text-teal-600 text-xs font-semibold hover:underline flex items-center gap-1 mt-1">
                        <Mail className="w-3.5 h-3.5" /> {msg.email}
                      </a>
                    </div>
                  </div>
                  
                  {/* Timestamp */}
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Message Content */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                  "{msg.message}"
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleDelete(msg._id)}
                  className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl border border-rose-200/55 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Message
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-sm">No contact messages received yet.</p>
        </div>
      )}
    </div>
  );
};

export default ManageMessages;
