import React, { useEffect, useState } from "react"
import axiosInstance from "../api/axiosInstance"

export default function StudentProfile() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axiosInstance
      .get("users/students/profile/")
      .then(res => setProfile(res.data))
  }, [])

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const saveProfile = async () => {
    setSaving(true)
    await axiosInstance.put("users/students/profile/", {
      full_name: profile.full_name,
      phone: profile.phone,
      guardian_name: profile.guardian_name,
      guardian_contact: profile.guardian_contact,
    })
    setEditing(false)
    setSaving(false)
    alert("Profile updated")
  }

  const uploadImage = async () => {
    if (!image) return alert("Select an image")

    const formData = new FormData()
    formData.append("image", image)

    const res = await axiosInstance.post(
      "accounts/profile/image/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )

    setProfile(p => ({
      ...p,
      profile_image: res.data.profile_image
    }))
  }

  if (!profile) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Student Profile</h1>

      <div className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT – PROFILE IMAGE */}
        <div className="flex flex-col items-center">
          <img
            src={profile.profile_image || "/avatar.png"}
            alt="Profile"
            className="w-36 h-36 rounded-full object-cover border"
          />

          <input
            type="file"
            accept="image/*"
            className="mt-4 text-sm"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <button
            onClick={uploadImage}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Upload Photo
          </button>
        </div>

        {/* RIGHT – DETAILS */}
        <div className="md:col-span-2">
          {!editing ? (
            <div className="space-y-4">
              <Info label="Name" value={profile.full_name} />
              <Info label="Email" value={profile.email} />
              <Info label="Phone" value={profile.phone} />
              <Info label="Guardian Name" value={profile.guardian_name} />
              <Info label="Guardian Contact" value={profile.guardian_contact} />

              <hr />

              <div className="grid grid-cols-2 gap-6">
                <Info label="Admission No" value={profile.admission_number} />
                <Info label="Roll Number" value={profile.roll_number} />
                <Info label="Class" value={profile.class_id} />
                <Info label="Admission Date" value={profile.admission_date} />
              </div>

              <button
                onClick={() => setEditing(true)}
                className="mt-6 px-5 py-2 bg-gray-800 text-white rounded hover:bg-black"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                name="full_name"
                value={profile.full_name || ""}
                onChange={handleChange}
                placeholder="Full Name"
                className="input"
              />

              <input
                name="phone"
                value={profile.phone || ""}
                onChange={handleChange}
                placeholder="Phone"
                className="input"
              />

              <input
                name="guardian_name"
                value={profile.guardian_name || ""}
                onChange={handleChange}
                placeholder="Guardian Name"
                className="input"
              />

              <input
                name="guardian_contact"
                value={profile.guardian_contact || ""}
                onChange={handleChange}
                placeholder="Guardian Contact"
                className="input"
              />

              <div className="flex gap-4 pt-4">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-5 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

const Info = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value || "—"}</p>
  </div>
)
