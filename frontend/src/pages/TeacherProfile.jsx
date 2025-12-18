import React, { useEffect, useState } from "react"
import axiosInstance from "../api/axiosInstance"

export default function TeacherProfile() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axiosInstance.get("users/teachers/profile/")
      .then(res => setProfile(res.data))
  }, [])

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const saveProfile = async () => {
    setSaving(true)
    await axiosInstance.put("users/teachers/profile/", {
      full_name: profile.full_name,
      phone: profile.phone,
      gender: profile.gender,
      DOB: profile.DOB,
      qualification: profile.qualification,
      joining_date: profile.joining_date,
      salary: profile.salary,
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

    setProfile(p => ({ ...p, profile_image: res.data.profile_image }))
  }

  if (!profile) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Teacher Profile</h1>

      <div className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="flex flex-col items-center">
          <img
            src={profile.profile_image || "/avatar.png"}
            className="w-36 h-36 rounded-full object-cover border"
          />

          <input
            type="file"
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

        {/* RIGHT */}
        <div className="md:col-span-2">
          {!editing ? (
            <div className="space-y-4">
              <Info label="Name" value={profile.full_name} />
              <Info label="Email" value={profile.email} />
              <Info label="Phone" value={profile.phone} />
              <Info label="Gender" value={profile.gender} />
              <Info label="DOB" value={profile.DOB} />
              <Info label="Qualification" value={profile.qualification} />
              <Info label="Joining Date" value={profile.joining_date} />
              <Info label="Salary" value={profile.salary} />

              <button
                onClick={() => setEditing(true)}
                className="mt-6 px-5 py-2 bg-gray-800 text-white rounded"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input name="full_name" value={profile.full_name || ""} onChange={handleChange} className="input" placeholder="Name" />
              <input name="phone" value={profile.phone || ""} onChange={handleChange} className="input" placeholder="Phone" />

              <select name="gender" value={profile.gender || ""} onChange={handleChange} className="input">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input type="date" name="DOB" value={profile.DOB || ""} onChange={handleChange} className="input" />
              <input name="qualification" value={profile.qualification || ""} onChange={handleChange} className="input" placeholder="Qualification" />
              <input type="date" name="joining_date" value={profile.joining_date || ""} onChange={handleChange} className="input" />
              <input type="number" name="salary" value={profile.salary || ""} onChange={handleChange} className="input" placeholder="Salary" />

              <div className="flex gap-4">
                <button onClick={saveProfile} disabled={saving} className="px-5 py-2 bg-green-600 text-white rounded">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setEditing(false)} className="px-5 py-2 bg-gray-300 rounded">
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
