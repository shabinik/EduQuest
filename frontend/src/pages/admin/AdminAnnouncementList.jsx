import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";


  //  CREATE ANNOUNCEMENT FORM

export function CreateAnnouncementForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    target_audience: "all",
    expiry_date: "",
    attachment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    if (!form.expiry_date) {
      setError("Expiry date is required");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("academics/create/announcement/", form);
      toast.success("Announcement created successfully");
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.expiry_date?.[0] || "Failed to create Announcement" )
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-xl font-bold mb-4">📢 Create Announcement</h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Announcement title"
          className="w-full p-3 border rounded"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Announcement description"
          className="w-full p-3 border rounded"
          rows={4}
        />

        <select
          name="target_audience"
          value={form.target_audience}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        >
          <option value="all">All</option>
          <option value="teachers">Teachers</option>
          <option value="students">Students</option>
        </select>

        <input
          type="datetime-local"
          name="expiry_date"
          value={form.expiry_date}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <input
          name="attachment"
          value={form.attachment}
          onChange={handleChange}
          placeholder="Attachment URL (optional)"
          className="w-full p-3 border rounded"
        />

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            {loading ? "Creating..." : "✓ Create"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 px-6 py-2 rounded-lg"
          >
            ✕ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}


  //  EDIT ANNOUNCEMENT FORM


export function EditAnnouncementForm({ announcement, onUpdated, onCancel }) {
  const [form, setForm] = useState({
    title: announcement.title,
    description: announcement.description,
    target_audience: announcement.target_audience,
    expiry_date: announcement.expiry_date?.slice(0, 16),
    attachment: announcement.attachment || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = async () => {
    setLoading(true);
    try {
      await axiosInstance.put(
        `academics/announcement/admin/detail/${announcement.id}/`,
        form
      );
      toast.success("Announcement updated");
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.expiry_date?.[0] || "Failed to edit Announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-xl font-bold mb-4">✏️ Edit Announcement</h3>

      <div className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full p-3 border rounded"
        />

        <select
          name="target_audience"
          value={form.target_audience}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        >
          <option value="all">All</option>
          <option value="teachers">Teachers</option>
          <option value="students">Students</option>
        </select>

        <input
          type="datetime-local"
          name="expiry_date"
          value={form.expiry_date}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <div className="flex gap-3 pt-4">
          <button
            onClick={save}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            {loading ? "Saving..." : "💾 Save"}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 px-6 py-2 rounded-lg"
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


  //  ANNOUNCEMENT LIST

export default function AdminAnnouncementList() {
  const [announcements, setAnnouncements] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        "academics/admin/announcement/list/"
      );
      setAnnouncements(res.data);
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await axiosInstance.delete(
        `announcements/announcement/admin/detail/${id}/`
      );
      toast.success("Announcement deleted");
      fetchAnnouncements();
    } catch {
      toast.error("Failed to delete announcement");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">📢 Announcements</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          + Create Announcement
        </button>
      </div>

      {showAdd && (
        <CreateAnnouncementForm
          onCreated={() => {
            setShowAdd(false);
            fetchAnnouncements();
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {editing && (
        <EditAnnouncementForm
          announcement={editing}
          onUpdated={() => {
            setEditing(null);
            fetchAnnouncements();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-center">Audience</th>
              <th className="p-4 text-center">Expiry</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-4">{a.title}</td>
                <td className="p-4 text-center">{a.target_audience}</td>
                <td className="p-4 text-center">
                  {new Date(a.expiry_date).toLocaleDateString()}
                </td>
                <td className="p-4 text-center">
                  {a.is_active ? "🟢 Active" : "🔴 Expired"}
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button
                    onClick={() => setEditing(a)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
            {announcements.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  No announcements found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
