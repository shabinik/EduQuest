import React, { useEffect, useState } from "react"
import axiosInstance from "../../api/axiosInstance"
import toast from "react-hot-toast"

export default function StudentProfile() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axiosInstance.get("users/students/profile/").then(res => {
      const data = res.data
      setProfile({
        ...data,
        full_name: data.full_name || "",
        phone: data.phone || "",
        guardian_name: data.guardian_name || "",
        guardian_contact: data.guardian_contact || "",
      })
    })
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
    setSaving(false)
    setEditing(false)
    toast.success("Profile updated successfully")
  }

  const uploadImage = async () => {
    if (!image) return toast.error("Select an image first")
    const formData = new FormData()
    formData.append("image", image)
    const res = await axiosInstance.post(
      "accounts/profile/image/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
    setProfile((p) => ({ ...p, profile_image: res.data.profile_image }))
  }

  if (!profile) return <div className="p-6 text-gray-500">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Student Profile</h1>
        <p className="text-gray-500 mt-1">Your personal and academic information</p>
      </div>

      {/* CARD CONTAINER */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-32"></div>

        <div className="px-8 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* PROFILE IMAGE */}
            <div className="flex flex-col items-center -mt-16">
              <div className="relative">
                <img
                  src={profile.profile_image || "/avatar.png"}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl bg-white"
                />
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              </div>

              <div className="mt-6 w-full space-y-3">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700 block mb-2">Change Profile Picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0 file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </label>

                <button
                  onClick={uploadImage}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Upload Photo
                </button>
              </div>
            </div>

            {/* PROFILE DETAILS */}
            <div className="lg:col-span-2 mt-6 lg:mt-0">

              {!editing ? (
                <div className="space-y-8">

                  {/* Personal Information */}
                  <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">👤</span>
                      Personal Information
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Info label="Full Name" value={profile.full_name} />
                      <Info label="Email" value={profile.email} />
                      <Info label="Phone" value={profile.phone} />
                      <Info label="Guardian Name" value={profile.guardian_name} />
                      <Info label="Guardian Contact" value={profile.guardian_contact} />
                    </div>
                  </section>

                  {/* Academic Section */}
                  <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">🎒</span>
                      Academic Information
                    </h3>
                    <div className="bg-indigo-50 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Info label="Admission No" value={profile.admission_number} />
                      <Info label="Roll Number" value={profile.roll_number} />
                      <Info label="Class" value={profile.class_id} />
                      <Info label="Admission Date" value={profile.admission_date} />
                    </div>
                  </section>

                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-black shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    ✏️ Edit Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* Edit Form */}
                  <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input name="full_name" value={profile.full_name} label="Full Name" onChange={handleChange} />
                      <Input name="phone" value={profile.phone} label="Phone Number" onChange={handleChange} />
                      <Input name="guardian_name" value={profile.guardian_name} label="Guardian Name" onChange={handleChange} />
                      <Input name="guardian_contact" value={profile.guardian_contact} label="Guardian Contact" onChange={handleChange} />
                    </div>
                  </section>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg shadow-md transition-all duration-200"
                    >
                      {saving ? "Saving..." : "💾 Save Changes"}
                    </button>

                    <button
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 shadow"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Subcomponents */
const Info = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</p>
    <p className="text-gray-800 font-medium">{value || "—"}</p>
  </div>
)

const Input = ({ label,value, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <input
      {...props}
      value = {value ?? ""}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 
      focus:ring-indigo-500 shadow-sm"
    />
  </div>
)
