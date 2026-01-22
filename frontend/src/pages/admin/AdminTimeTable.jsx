import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import toast from "react-hot-toast";
import { 
  ChevronLeft, Plus, Eye, Clock, BookOpen, List, 
  AlertCircle, X, Edit2, Trash2, RotateCcw, Save 
} from 'lucide-react';

// --- SUB-COMPONENTS ---

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
    } catch (error) { toast.error("Conflict or Invalid Time: " + JSON.stringify(error.response?.data)); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this slot? This may leave gaps in your timetable.")) {
      await axiosInstance.delete(`classroom/timeslots/${id}/`);
      onRefresh();
    }
  };

  const resetForm = () => {
    setNewSlot({ start_time: '', end_time: '', is_break: false });
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold mb-4">{editId ? 'Edit Time Slot' : 'Add New Time Slot'}</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs font-bold text-gray-400 uppercase">Start</label>
            <input type="time" className="w-full border p-2 rounded-lg" 
              value={newSlot.start_time} onChange={e => setNewSlot({...newSlot, start_time: e.target.value})} />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs font-bold text-gray-400 uppercase">End</label>
            <input type="time" className="w-full border p-2 rounded-lg" 
              value={newSlot.end_time} onChange={e => setNewSlot({...newSlot, end_time: e.target.value})} />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input type="checkbox" checked={newSlot.is_break} onChange={e => setNewSlot({...newSlot, is_break: e.target.checked})} />
            <span className="text-sm font-bold text-gray-600">Break</span>
          </div>
          <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">{editId ? 'Update' : 'Add Slot'}</button>
          {editId && <button onClick={resetForm} className="p-2 text-gray-400"><RotateCcw/></button>}
        </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full">
          <tbody className="divide-y">
            {slots.map((s, idx) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold">Period {idx + 1}</td>
                <td className="p-4 font-mono">{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</td>
                <td className="p-4 text-right">
                  <button onClick={() => {setEditId(s.id); setNewSlot(s)}} className="text-indigo-600 mr-4"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-500"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};




const SubjectSetup = ({ subjects, onRefresh }) => {
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);

  const handleSave = async () => {
    if (editId) await axiosInstance.put(`classroom/subjects/${editId}/`, { name });
    else await axiosInstance.post('classroom/subjects/', { name });
    setName(''); setEditId(null); onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 flex gap-4">
        <input type="text" className="flex-1 border p-2 rounded-lg" value={name} onChange={e => setName(e.target.value)} placeholder="Subject Name" />
        <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">{editId ? 'Update' : 'Add'}</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {subjects.map(sub => (
          <div key={sub.id} className="bg-white p-4 rounded-lg border flex justify-between group">
            <span className="font-bold">{sub.name}</span>
            <div className="hidden group-flex gap-2 group-hover:flex">
              <button onClick={() => {setEditId(sub.id); setName(sub.name)}} className="text-indigo-600"><Edit2 size={14}/></button>
              <button onClick={async () => {if(window.confirm("Delete?")){await axiosInstance.delete(`classroom/subjects/${sub.id}/`); onRefresh();}}} className="text-red-500"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
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
      setTimetables(ttRes.data); setClasses(classRes.data); setTimeSlots(slotRes.data);
      setSubjects(subRes.data); setTeachers(teacherRes.data);
    } finally { setLoading(false); }
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
    } catch (e) { toast.error("Conflict: This teacher/class is busy at this time."); }
  };

  const handleDeleteEntry = async () => {
    if (window.confirm("Clear this period?")) {
        await axiosInstance.delete(`classroom/timetable-entries/${modalData.entryId}/`);
        fetchMatrix(activeTimetable.id);
        setShowEntryModal(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Timetable System</h1>
            <p className="text-gray-500">Configure schedules, slots, and subjects.</p>
          </div>
          {view === 'grid' && (
            <button 
                onClick={async () => { if(window.confirm("Clear entire grid?")){ await axiosInstance.post('classroom/timetable-entries/clear-timetable/', {timetable_id: activeTimetable.id}); fetchMatrix(activeTimetable.id); }}}
                className="text-red-500 font-bold text-xs uppercase border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50"
            >
                Clear Entire Grid
            </button>
          )}
        </header>

        {view === 'list' ? (
          <>
            <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl border w-fit shadow-sm">
              {['timetables', 'slots', 'subjects'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-lg font-bold capitalize ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>{tab}</button>
              ))}
            </div>

            {activeTab === 'timetables' && (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold">Active Timetables</h2>
                  <button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-semibold"><Plus size={18} /> Add Timetable</button>
                </div>
                <table className="w-full text-left">
                  <tbody className="divide-y">
                    {timetables.map(tt => (
                      <tr key={tt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold">{tt.class_name} - {tt.division}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => { setActiveTimetable(tt); fetchMatrix(tt.id); setView('grid'); }} className="text-indigo-600 font-bold text-sm flex items-center gap-1 ml-auto">
                            <Eye size={14}/> Manage Grid
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'slots' && <TimeSlotSetup slots={timeSlots} onRefresh={fetchInitialData} />}
            {activeTab === 'subjects' && <SubjectSetup subjects={subjects} onRefresh={fetchInitialData} />}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ChevronLeft size={24} /></button>
              <h2 className="text-2xl font-black">{activeTimetable?.class_name} {activeTimetable?.division}</h2>
            </div>
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 border text-center text-xs font-black uppercase text-gray-400">Day / Time</th>
                    {timeSlots.map(slot => (
                      <th key={slot.id} className="p-4 border text-center font-mono text-indigo-600 text-sm">{slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "mon", label: "Mon" }, { key: "tue", label: "Tue" }, { key: "wed", label: "Wed" },
                    { key: "thu", label: "Thu" }, { key: "fri", label: "Fri" }, { key: "sat", label: "Sat" }
                  ].map(day => (
                    <tr key={day.key}>
                      <td className="p-4 font-black bg-indigo-50 text-indigo-700 text-xs uppercase border text-center">{day.label}</td>
                      {timeSlots.map(slot => {
                        const cell = matrix[day.key]?.[slot.id];
                        return (
                          <td key={`${day.key}-${slot.id}`} className="p-1 border h-24 min-w-[140px]">
                            {slot.is_break ? (
                              <div className="h-full flex items-center justify-center bg-amber-50 rounded-lg border border-amber-100 text-[10px] font-black uppercase tracking-widest text-amber-700">Break</div>
                            ) : (
                              <button 
                                onClick={() => openGridModal(day.key, slot.id, cell)}
                                className={`w-full h-full rounded-lg p-2 text-center transition flex flex-col items-center justify-center ${cell ? 'bg-indigo-50 border border-indigo-200' : 'border-2 border-dashed border-gray-100 hover:bg-gray-50 text-gray-300'}`}
                              >
                                {cell ? (
                                  <>
                                    <span className="text-xs font-black text-indigo-900 leading-tight">{cell.subject}</span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">{cell.teacher}</span>
                                  </>
                                ) : <Plus size={16}/>}
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

        {/* Schedule Entry Modal */}
        {showEntryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{modalData.entryId ? 'Edit Period' : 'Assign Subject'}</h3>
                <button onClick={() => setShowEntryModal(false)} className="text-gray-400"><X size={20}/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Subject</label>
                  <select className="w-full border rounded-lg p-3 mt-1" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Teacher</label>
                  <select className="w-full border rounded-lg p-3 mt-1" value={formData.teacher} onChange={e => setFormData({...formData, teacher: e.target.value})}>
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>
                <div className="pt-4 flex flex-col gap-2">
                    <button onClick={handleSaveEntry} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"><Save size={18}/> {modalData.entryId ? 'Update Period' : 'Save Period'}</button>
                    {modalData.entryId && (
                        <button onClick={handleDeleteEntry} className="w-full py-3 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition"><Trash2 size={18}/> Remove Subject</button>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTimeTable;