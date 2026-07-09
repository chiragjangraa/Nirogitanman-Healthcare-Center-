import React, { useEffect, useState } from 'react';
import { medicalRecordsAPI, usersAPI } from '../services/api';
import { Plus, Edit2, Trash2, X, Search, ShieldAlert, FileText, Clipboard } from 'lucide-react';

const ManageMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    doctorName: '',
    date: '',
    diagnosis: '',
    prescription: '',
    reportsRaw: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recordsRes, patientsRes] = await Promise.all([
        medicalRecordsAPI.getAll(),
        usersAPI.getAll()
      ]);
      setRecords(recordsRes.data);
      setPatients(patientsRes.data);
    } catch (err) {
      console.error('Failed to load medical records or patients list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      userId: '',
      doctorName: '',
      date: new Date().toISOString().split('T')[0],
      diagnosis: '',
      prescription: '',
      reportsRaw: '',
      notes: ''
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      userId: rec.userId?._id || rec.userId || '',
      doctorName: rec.doctorName,
      date: rec.date,
      diagnosis: rec.diagnosis,
      prescription: rec.prescription,
      reportsRaw: rec.reports ? rec.reports.join(', ') : '',
      notes: rec.notes || ''
    });
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical record?')) return;
    try {
      await medicalRecordsAPI.delete(id);
      setRecords(records.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete medical record: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const processedReports = formData.reportsRaw
      ? formData.reportsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    const submitData = {
      userId: formData.userId,
      doctorName: formData.doctorName,
      date: formData.date,
      diagnosis: formData.diagnosis,
      prescription: formData.prescription,
      reports: processedReports,
      notes: formData.notes
    };

    try {
      if (editingRecord) {
        const res = await medicalRecordsAPI.update(editingRecord._id, submitData);
        // Refresh records to populate patient info correctly
        const refreshedRes = await medicalRecordsAPI.getAll();
        setRecords(refreshedRes.data);
      } else {
        const res = await medicalRecordsAPI.create(submitData);
        // Refresh records to populate patient info correctly
        const refreshedRes = await medicalRecordsAPI.getAll();
        setRecords(refreshedRes.data);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medical record.');
    } finally {
      setSaving(false);
    }
  };

  const getPatientName = (rec) => {
    if (rec.userId && typeof rec.userId === 'object') {
      return rec.userId.name;
    }
    const patientObj = patients.find(p => p._id === rec.userId);
    return patientObj ? patientObj.name : 'Unknown Patient';
  };

  const filteredRecords = records.filter(rec => {
    const patientName = getPatientName(rec).toLowerCase();
    const diagnosis = rec.diagnosis.toLowerCase();
    const doctorName = rec.doctorName.toLowerCase();
    const search = searchTerm.toLowerCase();
    return patientName.includes(search) || diagnosis.includes(search) || doctorName.includes(search);
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manage Patient Medical Records</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">Record clinical diagnostics, write prescriptions, and review notes.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-100 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4.5 h-4.5" /> Add Medical Record
        </button>
      </div>

      {/* Search Input */}
      <div className="flex bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by patient name, physician, or diagnosis..."
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
      ) : filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecords.map((rec) => (
            <div key={rec._id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-teal-50 text-teal-600 p-2.5 rounded-xl border border-teal-100 shrink-0">
                      <Clipboard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-base leading-tight">
                        {getPatientName(rec)}
                      </h4>
                      <p className="text-slate-400 text-xs mt-0.5 font-medium">Physician: Dr. {rec.doctorName}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                    {rec.date}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Diagnosis</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-relaxed">{rec.diagnosis}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Prescription / Treatment Plan</span>
                    <p className="text-xs text-slate-600 bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl font-mono mt-0.5 whitespace-pre-line leading-relaxed">
                      {rec.prescription}
                    </p>
                  </div>
                  {rec.notes && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Additional Doctor Notes</span>
                      <p className="text-xs text-slate-500 italic mt-0.5 leading-relaxed">"{rec.notes}"</p>
                    </div>
                  )}
                  {rec.reports && rec.reports.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rec.reports.map((rep, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                          <FileText className="w-3 h-3" /> {rep}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2 justify-end">
                <button
                  onClick={() => handleOpenEdit(rec)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-teal-200 transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Record
                </button>
                <button
                  onClick={() => handleDelete(rec._id)}
                  className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl border border-rose-200/50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-sm">No medical records found.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingRecord ? 'Edit Patient Medical Record' : 'Record New Medical File'}
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

              {/* Patient Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Patient</label>
                {editingRecord ? (
                  <input
                    type="text"
                    disabled
                    value={getPatientName(editingRecord)}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                  />
                ) : (
                  <select
                    required
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Patient User</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Doctor Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alok Sharma"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                  />
                </div>
                {/* Consultation Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consultation Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Diagnosis */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnosis</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hypertension & High Blood Sugar levels"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                />
              </div>

              {/* Prescription */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prescription / Treatment Plan</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Enter medical prescriptions: dosage, medication timings, and active guidelines..."
                  value={formData.prescription}
                  onChange={(e) => setFormData({...formData, prescription: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all resize-none font-mono"
                ></textarea>
              </div>

              {/* Reports list */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attached Reports (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Blood Test, Chest X-Ray, ECG Report"
                  value={formData.reportsRaw}
                  onChange={(e) => setFormData({...formData, reportsRaw: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor Notes (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Additional patient guidance or clinical reviews..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm transition-all resize-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-all text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-md shadow-teal-100 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Medical Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMedicalRecords;
