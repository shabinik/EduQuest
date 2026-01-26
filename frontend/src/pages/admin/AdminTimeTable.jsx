import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import toast from "react-hot-toast";
import { 
  ChevronLeft, Plus, Eye, Clock, BookOpen, 
  Edit2, Trash2, Save, X
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
    <div className="space-y-4">
      {/* Add/Edit Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4">
          {editId ? 'Edit Time Slot' : 'Add Time Slot'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Start Time</label>
            <input 
              type="time" 
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={newSlot.start_time} 
              onChange={e => setNewSlot({...newSlot, start_time: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">End Time</label>
            <input 
              type="time" 
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={newSlot.end_time} 
              onChange={e => setNewSlot({...newSlot, end_time: e.target.value})} 
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={newSlot.is_break} 
                onChange={e => setNewSlot({...newSlot, is_break: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-gray-700">Mark as Break</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              {editId ? 'Update' : 'Add'}
            </button>
            {editId && (
              <button 
                onClick={resetForm} 
                className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Slots List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {slots.map((s, idx) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-800">Period {idx + 1}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">
                    {s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}
                  </td>
                  <td className="px-6 py-4">
                    {s.is_break ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        Break
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        Class
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {setEditId(s.id); setNewSlot(s)}} 
                      className="text-indigo-600 hover:text-indigo-800 mr-3 transition"
                    >
                      <Edit2 size={16}/>
                    </button>
                    <button 
                      onClick={() => handleDelete(s.id)} 
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
              {slots.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    No time slots added yet
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

  return (
    <div className="space-y-4">
      {/* Add/Edit Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4">
          {editId ? 'Edit Subject' : 'Add Subject'}
        </h3>
        <div className="flex gap-3">
          <input 
            type="text" 
            className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Subject Name"
            onKeyPress={e => e.key === 'Enter' && handleSave()}
          />
          <button 
            onClick={handleSave} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {editId ? 'Update' : 'Add'}
          </button>
          {editId && (
            <button 
              onClick={() => {setEditId(null); setName('')}} 
              className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {subjects.map(sub => (
          <div 
            key={sub.id} 
            className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between group hover:shadow-md transition"
          >
            <span className="font-semibold text-gray-800">{sub.name}</span>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button 
                onClick={() => {setEditId(sub.id); setName(sub.name)}} 
                className="text-indigo-600 hover:text-indigo-800 transition"
              >
                <Edit2 size={16}/>
              </button>
              <button 
                onClick={() => handleDelete(sub.id)} 
                className="text-red-600 hover:text-red-800 transition"
              >
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-400">
            No subjects added yet
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading timetable data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Time Table Management</h1>
            <p className="text-gray-600 mt-1">Manage schedules, time slots, and subjects</p>
          </div>
          {view === 'grid' && (
            <button 
              onClick={handleClearTimetable}
              className="text-red-600 hover:text-red-700 border border-red-300 hover:bg-red-50 px-4 py-2 rounded-lg font-semibold transition text-sm"
            >
              Clear Entire Grid
            </button>
          )}
        </div>

        {view === 'list' ? (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg border border-gray-200 w-fit">
              {[
                { key: 'timetables', label: 'Timetables', icon: Clock },
                { key: 'slots', label: 'Time Slots', icon: Clock },
                { key: 'subjects', label: 'Subjects', icon: BookOpen }
              ].map(tab => (
                <button 
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition ${
                    activeTab === tab.key 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Timetables Tab */}
            {activeTab === 'timetables' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Class Timetables</h2>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition"
                  >
                    <Plus size={18} /> Create Timetable
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Division</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {timetables.map(tt => (
                        <tr key={tt.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-semibold text-gray-800">{tt.class_name}</td>
                          <td className="px-6 py-4 text-gray-600">{tt.division}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => {
                                setActiveTimetable(tt);
                                fetchMatrix(tt.id);
                                setView('grid');
                              }}
                              className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 transition"
                            >
                              <Eye size={16}/> View Grid
                            </button>
                          </td>
                        </tr>
                      ))}
                      {timetables.length === 0 && (
                        <tr>
                          <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                            No timetables created yet. Click "Create Timetable" to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Slots Tab */}
            {activeTab === 'slots' && <TimeSlotSetup slots={timeSlots} onRefresh={fetchInitialData} />}

            {/* Subjects Tab */}
            {activeTab === 'subjects' && <SubjectSetup subjects={subjects} onRefresh={fetchInitialData} />}
          </>
        ) : (
          // Timetable Grid View
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
              <button 
                onClick={() => setView('list')}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
              >
                <ChevronLeft size={24} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeTimetable?.class_name} - {activeTimetable?.division}
                </h2>
                <p className="text-sm text-gray-600">Click on any cell to assign a subject and teacher</p>
              </div>
            </div>
            
            <div className="p-6 overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 text-center min-w-[100px]">
                      Day / Time
                    </th>
                    {timeSlots.map(slot => (
                      <th 
                        key={slot.id}
                        className="border border-gray-300 px-3 py-3 text-center min-w-[140px]"
                      >
                        <div className="text-xs font-semibold text-gray-600">
                          {slot.start_time.slice(0,5)}
                        </div>
                        <div className="text-xs font-semibold text-gray-600">
                          {slot.end_time.slice(0,5)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "mon", label: "Monday" },
                    { key: "tue", label: "Tuesday" },
                    { key: "wed", label: "Wednesday" },
                    { key: "thu", label: "Thursday" },
                    { key: "fri", label: "Friday" },
                    { key: "sat", label: "Saturday" }
                  ].map(day => (
                    <tr key={day.key}>
                      <td className="border border-gray-300 px-4 py-3 font-bold text-gray-800 bg-gray-50 text-center">
                        {day.label}
                      </td>
                      {timeSlots.map(slot => {
                        const cell = matrix[day.key]?.[slot.id];
                        return (
                          <td 
                            key={`${day.key}-${slot.id}`}
                            className="border border-gray-300 p-2 h-24"
                          >
                            {slot.is_break ? (
                              <div className="h-full flex items-center justify-center bg-amber-50 rounded text-xs font-bold text-amber-700">
                                BREAK
                              </div>
                            ) : (
                              <button 
                                onClick={() => openGridModal(day.key, slot.id, cell)}
                                className={`w-full h-full rounded p-2 text-center transition ${
                                  cell 
                                    ? 'bg-indigo-50 hover:bg-indigo-100 border border-indigo-200' 
                                    : 'border-2 border-dashed border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                              >
                                {cell ? (
                                  <div className="space-y-1">
                                    <div className="text-sm font-bold text-indigo-900">
                                      {cell.subject}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {cell.teacher}
                                    </div>
                                  </div>
                                ) : (
                                  <Plus size={20} className="mx-auto text-gray-400" />
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
        )}

        {/* Entry Modal */}
        {showEntryModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {modalData.entryId ? 'Edit Period' : 'Assign Period'}
                </h3>
                <button 
                  onClick={() => setShowEntryModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={20}/>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Subject</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Teacher</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.teacher}
                    onChange={e => setFormData({...formData, teacher: e.target.value})}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 space-y-2">
                  <button 
                    onClick={handleSaveEntry}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Save size={18}/> {modalData.entryId ? 'Update Period' : 'Save Period'}
                  </button>
                  
                  {modalData.entryId && (
                    <button 
                      onClick={handleDeleteEntry}
                      className="w-full text-red-600 hover:bg-red-50 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <Trash2 size={18}/> Clear Period
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Timetable Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Create Timetable</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={20}/>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Select Class & Division
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                  >
                    <option value="">Choose a class...</option>
                    {classes.map(cls=> (
                      <option key={cls.id} value={cls.id}>
                        {cls.label}
                      </option>
                    ))}
                  </select>
                <p className="text-xs text-gray-500 mt-2">
                  Only classes without an existing timetable can be selected
                </p>
              </div>
              <button 
                onClick={handleCreateTimetable}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
              >
                <Plus size={18}/> Create Timetable
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