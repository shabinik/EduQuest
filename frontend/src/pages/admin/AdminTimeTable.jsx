import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import toast from "react-hot-toast";
import { 
  ChevronLeft, Plus, Eye, Clock, BookOpen, 
  Edit2, Trash2, Save, X, Calendar, GraduationCap, LayoutGrid
} from 'lucide-react';

// --- TIME SLOT SETUP ---
const TimeSlotSetup = ({ slots, onRefresh }) => {
  const [newSlot, setNewSlot] = useState({ start_time: '', end_time: '', is_break: false });
  const [editId, setEditId] = useState(null);

  const handleSave = async () => {
    try {
      if (editId) {
        await axiosInstance.put(`classroom/timeslots/${editId}/`, newSlot);
      } else {
        await axiosInstance.post('classroom/timeslots/', newSlot);
      }
      resetForm();
      onRefresh();
      toast.success("Time slot saved");
    } catch (error) { 
      const msg = error.response?.data ? Object.values(error.response.data).flat()[0] : "Invalid Time";
      toast.error(msg); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this slot?")) {
      await axiosInstance.delete(`classroom/timeslots/${id}/`);
      onRefresh();
      toast.success("Slot deleted");
    }
  };

  const resetForm = () => {
    setNewSlot({ start_time: '', end_time: '', is_break: false });
    setEditId(null);
  };

  return (
    <div className="space-y-5">
      {/* Add/Edit Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block"></span>
          {editId ? 'Edit Time Slot' : 'Add New Time Slot'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Start Time</label>
            <input 
              type="time" 
              className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition" 
              value={newSlot.start_time} 
              onChange={e => setNewSlot({...newSlot, start_time: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">End Time</label>
            <input 
              type="time" 
              className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition" 
              value={newSlot.end_time} 
              onChange={e => setNewSlot({...newSlot, end_time: e.target.value})} 
            />
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={newSlot.is_break} 
                  onChange={e => setNewSlot({...newSlot, is_break: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 peer-checked:bg-amber-400 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-amber-300"></div>
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
              </div>
              <span className="text-sm font-semibold text-slate-700">Break Period</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold transition shadow-sm shadow-indigo-200"
            >
              {editId ? 'Update' : 'Add Slot'}
            </button>
            {editId && (
              <button 
                onClick={resetForm} 
                className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-xl transition"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Slots List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Time Range</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slots.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <span className="font-semibold text-slate-700">Period {idx + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-600 tracking-tight">
                    {s.start_time.slice(0,5)} <span className="text-slate-300 mx-1">→</span> {s.end_time.slice(0,5)}
                  </td>
                  <td className="px-6 py-4">
                    {s.is_break ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Break
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Class
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={() => {setEditId(s.id); setNewSlot(s)}} 
                        className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Edit2 size={15}/>
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id)} 
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {slots.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <Clock className="mx-auto mb-2 opacity-30" size={32} />
                    <p className="text-sm">No time slots added yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- SUBJECT SETUP ---
const SubjectSetup = ({ subjects, onRefresh }) => {
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Subject name is required");
      return;
    }
    try {
      if (editId) {
        await axiosInstance.put(`classroom/subjects/${editId}/`, { name });
      } else {
        await axiosInstance.post('classroom/subjects/', { name });
      }
      setName('');
      setEditId(null);
      onRefresh();
      toast.success("Subject saved");
    } catch (e) {
      toast.error(e.response?.data?.name?.[0] || "Error saving subject");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this subject?")) {
      await axiosInstance.delete(`classroom/subjects/${id}/`);
      onRefresh();
      toast.success("Subject deleted");
    }
  };

  const subjectColors = [
    'bg-violet-50 border-violet-200 text-violet-700',
    'bg-blue-50 border-blue-200 text-blue-700',
    'bg-emerald-50 border-emerald-200 text-emerald-700',
    'bg-rose-50 border-rose-200 text-rose-700',
    'bg-amber-50 border-amber-200 text-amber-700',
    'bg-cyan-50 border-cyan-200 text-cyan-700',
  ];

  return (
    <div className="space-y-5">
      {/* Add/Edit Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block"></span>
          {editId ? 'Edit Subject' : 'Add New Subject'}
        </h3>
        <div className="flex gap-3">
          <input 
            type="text" 
            className="flex-1 border border-slate-200 bg-slate-50 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="e.g. Mathematics, Physics..."
            onKeyPress={e => e.key === 'Enter' && handleSave()}
          />
          <button 
            onClick={handleSave} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition shadow-sm shadow-indigo-200"
          >
            {editId ? 'Update' : 'Add'}
          </button>
          {editId && (
            <button 
              onClick={() => {setEditId(null); setName('')}} 
              className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-xl transition"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {subjects.map((sub, i) => (
          <div 
            key={sub.id} 
            className={`bg-white p-4 rounded-2xl border flex items-center justify-between group hover:shadow-md transition ${subjectColors[i % subjectColors.length]}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center text-sm font-bold">
                {sub.name.charAt(0)}
              </div>
              <span className="font-semibold">{sub.name}</span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <button 
                onClick={() => {setEditId(sub.id); setName(sub.name)}} 
                className="p-1.5 hover:bg-white/60 rounded-lg transition"
              >
                <Edit2 size={14}/>
              </button>
              <button 
                onClick={() => handleDelete(sub.id)} 
                className="p-1.5 hover:bg-white/60 rounded-lg transition"
              >
                <Trash2 size={14}/>
              </button>
            </div>
          </div>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            <BookOpen className="mx-auto mb-2 opacity-30" size={32} />
            <p className="text-sm">No subjects added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const AdminTimeTable = () => {
  const [activeTab, setActiveTab] = useState('timetables');
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [activeTimetable, setActiveTimetable] = useState(null);
  const [matrix, setMatrix] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [modalData, setModalData] = useState({ day: '', slotId: '', entryId: null });
  const [formData, setFormData] = useState({ subject: '', teacher: '' });

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [ttRes, classRes, slotRes, subRes, teacherRes] = await Promise.all([
        axiosInstance.get('classroom/timetables/'),
        axiosInstance.get('classroom/classes/dropdown/'),
        axiosInstance.get('classroom/timeslots/'),
        axiosInstance.get('classroom/subjects/'),
        axiosInstance.get('users/teachers/')
      ]);
      setTimetables(ttRes.data);
      setClasses(classRes.data);
      setTimeSlots(slotRes.data);
      setSubjects(subRes.data);
      setTeachers(teacherRes.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatrix = async (tId) => {
    const res = await axiosInstance.get(`classroom/timetables/${tId}/matrix/`);
    setMatrix(res.data);
  };

  const openGridModal = (dayKey, slotId, existingEntry = null) => {
    setModalData({ day: dayKey, slotId: slotId, entryId: existingEntry?.id || null });
    setFormData({ 
      subject: existingEntry?.subject_id || '', 
      teacher: existingEntry?.teacher_id || '' 
    });
    setShowEntryModal(true);
  };

  const handleSaveEntry = async () => {
    if (!formData.subject || !formData.teacher) {
      toast.error("Please select both subject and teacher");
      return;
    }

    const payload = {
      timetable: activeTimetable.id,
      day: modalData.day,
      slot: modalData.slotId,
      subject: formData.subject,
      teacher: formData.teacher
    };

    try {
      if (modalData.entryId) {
        await axiosInstance.put(`classroom/timetable-entries/${modalData.entryId}/`, payload);
      } else {
        await axiosInstance.post('classroom/timetable-entries/', payload);
      }
      fetchMatrix(activeTimetable.id);
      setShowEntryModal(false);
      toast.success("Period saved successfully");
    } catch (e) {
      const errorData = e.response?.data;
      if (errorData) {
        const firstError = Object.values(errorData).flat()[0];
        toast.error(firstError || "Error saving period");
      } else {
        toast.error("Conflict: Teacher or class is busy at this time");
      }
    }
  };

  const handleCreateTimetable = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class");
      return;
    }

    const alreadyExists = timetables.some(tt => tt.school_class === parseInt(selectedClassId));
    if (alreadyExists) {
      toast.error("This class already has a timetable");
      return;
    }

    try {
      const res = await axiosInstance.post('classroom/timetables/', {
        school_class: selectedClassId
      });
      toast.success("Timetable created successfully!");
      setShowCreateModal(false);
      setSelectedClassId('');
      fetchInitialData();
      setActiveTimetable(res.data);
      fetchMatrix(res.data.id);
      setView('grid');
    } catch (error) {
      const msg = error.response?.data?.non_field_errors?.[0] || 
                   error.response?.data?.[0] || 
                   "This class already has a timetable";
      toast.error(msg);
    }
  };

  const handleDeleteEntry = async () => {
    if (window.confirm("Clear this period?")) {
      await axiosInstance.delete(`classroom/timetable-entries/${modalData.entryId}/`);
      fetchMatrix(activeTimetable.id);
      setShowEntryModal(false);
      toast.success("Period cleared");
    }
  };

  const handleClearTimetable = async () => {
    if (window.confirm("Clear the entire timetable? This cannot be undone.")) {
      await axiosInstance.post('classroom/timetable-entries/clear-timetable/', {
        timetable_id: activeTimetable.id
      });
      fetchMatrix(activeTimetable.id);
      toast.success("Timetable cleared");
    }
  };

  const DAYS = [
    { key: "mon", label: "Mon", full: "Monday" },
    { key: "tue", label: "Tue", full: "Tuesday" },
    { key: "wed", label: "Wed", full: "Wednesday" },
    { key: "thu", label: "Thu", full: "Thursday" },
    { key: "fri", label: "Fri", full: "Friday" },
    { key: "sat", label: "Sat", full: "Saturday" }
  ];

  // Count filled cells for a timetable (from the list view, we don't have matrix, so approximate)
  const getFilledCount = (tt) => {
    // placeholder — real data comes from matrix
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Loading timetable data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {view === 'list' ? (
          <>
            {/* ── PAGE HEADER ── */}
            <div className="mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Timetable Management</h1>
                  <p className="text-slate-500 mt-1 text-sm">Configure schedules, periods, and subjects for your school</p>
                </div>
              </div>
            </div>

            {/* ── TAB BAR ── */}
            <div className="flex gap-1 mb-6 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
              {[
                { key: 'timetables', label: 'Timetables', icon: LayoutGrid },
                { key: 'slots', label: 'Time Slots', icon: Clock },
                { key: 'subjects', label: 'Subjects', icon: BookOpen }
              ].map(tab => (
                <button 
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition-all ${
                    activeTab === tab.key 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <tab.icon size={15} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── TIMETABLES TAB ── */}
            {activeTab === 'timetables' && (
              <div>
                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <LayoutGrid size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-slate-800">{timetables.length}</p>
                      <p className="text-xs text-slate-500 font-medium">Total Timetables</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Clock size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-slate-800">{timeSlots.filter(s => !s.is_break).length}</p>
                      <p className="text-xs text-slate-500 font-medium">Class Periods</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center">
                      <BookOpen size={20} className="text-violet-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-slate-800">{subjects.length}</p>
                      <p className="text-xs text-slate-500 font-medium">Subjects</p>
                    </div>
                  </div>
                </div>

                {/* Timetable list card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-bold text-slate-800">Class Timetables</h2>
                      <p className="text-xs text-slate-400 mt-0.5">{timetables.length} schedule{timetables.length !== 1 ? 's' : ''} configured</p>
                    </div>
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold text-sm transition shadow-sm shadow-indigo-200"
                    >
                      <Plus size={16} /> New Timetable
                    </button>
                  </div>

                  {timetables.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calendar size={28} className="text-slate-400" />
                      </div>
                      <p className="font-semibold text-slate-600 mb-1">No timetables yet</p>
                      <p className="text-sm text-slate-400 mb-4">Create a timetable to start scheduling classes</p>
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition"
                      >
                        <Plus size={15} /> Create First Timetable
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {timetables.map((tt, idx) => (
                        <div 
                          key={tt.id} 
                          className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/70 transition group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-sm">
                              {tt.class_name?.charAt(0) || idx + 1}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{tt.class_name}</p>
                              <p className="text-xs text-slate-500">Division {tt.division}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                            <button 
                              onClick={() => {
                                setActiveTimetable(tt);
                                fetchMatrix(tt.id);
                                setView('grid');
                              }}
                              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                            >
                              <LayoutGrid size={14}/> Open Grid
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Slots Tab */}
            {activeTab === 'slots' && <TimeSlotSetup slots={timeSlots} onRefresh={fetchInitialData} />}

            {/* Subjects Tab */}
            {activeTab === 'subjects' && <SubjectSetup subjects={subjects} onRefresh={fetchInitialData} />}
          </>

        ) : (
          // ── TIMETABLE GRID VIEW ──
          <div>
            {/* Grid header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setView('list')}
                  className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-500 transition shadow-sm"
                >
                  <ChevronLeft size={22} />
                </button>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {activeTimetable?.class_name} 
                    <span className="text-slate-400 font-normal mx-2">·</span>
                    <span className="text-indigo-600">Division {activeTimetable?.division}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Click any cell to assign or edit a period</p>
                </div>
              </div>
              <button 
                onClick={handleClearTimetable}
                className="text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 hover:bg-red-50 px-4 py-2 rounded-xl font-semibold transition text-sm flex items-center gap-1.5"
              >
                <Trash2 size={14}/> Clear All
              </button>
            </div>

            {/* Grid card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {/* Corner cell */}
                      <th className="bg-slate-50 border-b border-r border-slate-200 px-4 py-3 min-w-[100px]">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Day</span>
                      </th>
                      {timeSlots.map((slot, i) => (
                        <th 
                          key={slot.id}
                          className={`border-b border-r last:border-r-0 border-slate-200 px-3 py-3 text-center min-w-[150px] ${slot.is_break ? 'bg-amber-50' : 'bg-slate-50'}`}
                        >
                          <div className={`text-xs font-bold uppercase tracking-wide mb-0.5 ${slot.is_break ? 'text-amber-600' : 'text-slate-500'}`}>
                            {slot.is_break ? 'Break' : `P${i + 1}`}
                          </div>
                          <div className="font-mono text-xs text-slate-500 font-semibold">
                            {slot.start_time.slice(0,5)}–{slot.end_time.slice(0,5)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day, di) => (
                      <tr key={day.key} className={di % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                        <td className="border-b border-r border-slate-200 px-4 py-2 bg-slate-50/80">
                          <div>
                            <p className="text-xs font-bold text-slate-700">{day.full}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{day.label}</p>
                          </div>
                        </td>
                        {timeSlots.map(slot => {
                          const cell = matrix[day.key]?.[slot.id];
                          return (
                            <td 
                              key={`${day.key}-${slot.id}`}
                              className="border-b border-r last:border-r-0 border-slate-200 p-1.5 h-20 align-top"
                            >
                              {slot.is_break ? (
                                <div className="h-full flex items-center justify-center bg-amber-50 rounded-lg text-xs font-bold text-amber-600 tracking-wide border border-amber-100">
                                  ☕ Break
                                </div>
                              ) : (
                                <button 
                                  onClick={() => openGridModal(day.key, slot.id, cell)}
                                  className={`w-full h-full rounded-xl p-2 text-left transition-all ${
                                    cell 
                                      ? 'bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-300 hover:shadow-sm' 
                                      : 'border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                                  }`}
                                >
                                  {cell ? (
                                    <div>
                                      <div className="text-xs font-bold text-indigo-900 leading-tight mb-0.5">
                                        {cell.subject}
                                      </div>
                                      <div className="text-[11px] text-slate-500 leading-tight">
                                        {cell.teacher}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-full flex items-center justify-center">
                                      <Plus size={18} className="text-slate-300" />
                                    </div>
                                  )}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ENTRY MODAL ── */}
        {showEntryModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {modalData.entryId ? 'Edit Period' : 'Assign Period'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 capitalize">
                    {DAYS.find(d => d.key === modalData.day)?.full}
                  </p>
                </div>
                <button 
                  onClick={() => setShowEntryModal(false)}
                  className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition"
                >
                  <X size={18}/>
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Subject</label>
                  <select 
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition text-sm"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  >
                    <option value="">Select a subject…</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Teacher</label>
                  <select 
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition text-sm"
                    value={formData.teacher}
                    onChange={e => setFormData({...formData, teacher: e.target.value})}
                  >
                    <option value="">Select a teacher…</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 space-y-2">
                  <button 
                    onClick={handleSaveEntry}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-sm shadow-indigo-200"
                  >
                    <Save size={16}/> {modalData.entryId ? 'Update Period' : 'Save Period'}
                  </button>
                  
                  {modalData.entryId && (
                    <button 
                      onClick={handleDeleteEntry}
                      className="w-full text-red-500 hover:bg-red-50 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition border border-red-100 hover:border-red-200"
                    >
                      <Trash2 size={16}/> Clear Period
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE TIMETABLE MODAL ── */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create Timetable</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Set up a weekly schedule for a class</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition"
                >
                  <X size={18}/>
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">
                    Class & Division
                  </label>
                  <select 
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition text-sm"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                  >
                    <option value="">Choose a class…</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-slate-300 rounded-full inline-block"></span>
                    Only classes without an existing timetable can be selected
                  </p>
                </div>
                <button 
                  onClick={handleCreateTimetable}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-sm shadow-indigo-200 mt-2"
                >
                  <Plus size={16}/> Create Timetable
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default AdminTimeTable;