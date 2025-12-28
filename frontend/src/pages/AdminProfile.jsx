import axiosInstance from "../api/axiosInstance"
import React, { useEffect, useState } from "react"

function AdminProfile() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [image, setImage] = useState(null)

  useEffect(() => {
    axiosInstance.get("accounts/admin/profile/")
      .then(res => setProfile(res.data))
  }, [])

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const saveProfile = async () => {
    await axiosInstance.put("accounts/admin/profile/", {
      full_name: profile.full_name,
      phone: profile.phone,
      gender: profile.gender,
      tenant_name: profile.tenant_name,
      tenant_email: profile.tenant_email,
      tenant_phone: profile.tenant_phone
    })
    setEditing(false)
    alert("Profile updated")
  }

  const uploadImage = async () => {
    if (!image) return alert("Select an image first")

    const formData = new FormData()
    formData.append("image", image)

    const res = await axiosInstance.post(
      "accounts/profile/image/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )

    setProfile(prev => ({
      ...prev,
      profile_image: res.data.profile_image
    }))
  }

  if (!profile) return <div className="p-6">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal and institute information</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-32"></div>
        
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT: PROFILE IMAGE */}
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
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </label>

                <button
                  onClick={uploadImage}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Upload Image
                </button>
              </div>
            </div>

            {/* RIGHT: DETAILS */}
            <div className="lg:col-span-2 mt-6 lg:mt-0">
              {!editing ? (
                <div className="space-y-6">
                  {/* Personal Information Section */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">👤</span>
                      Personal Information
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</p>
                          <p className="text-gray-800 font-medium">{profile.full_name}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Email Address</p>
                          <p className="text-gray-800">{profile.email}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</p>
                          <p className="text-gray-800">{profile.phone || "Not provided"}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Gender</p>
                          <p className="text-gray-800 capitalize">{profile.gender || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Institute Information Section */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">🏫</span>
                      Institute Information
                    </h3>
                    <div className="bg-indigo-50 rounded-xl p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Institute Name</p>
                          <p className="text-gray-800 font-medium">{profile.tenant_name}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Status</p>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            {profile.tenant_status}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Institute Email</p>
                          <p className="text-gray-800">{profile.tenant_email}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Institute Phone</p>
                          <p className="text-gray-800">{profile.tenant_phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-black shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    ✏️ Edit Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Edit Personal Information */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Personal Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                          <input
                            name="full_name"
                            value={profile.full_name || ""}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                          <input
                            name="phone"
                            value={profile.phone || ""}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                        <select
                          name="gender"
                          value={profile.gender || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Edit Institute Information */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Institute Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Institute Name</label>
                          <input
                            name="tenant_name"
                            value={profile.tenant_name || ""}
                            onChange={handleChange}
                            placeholder="Enter institute name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Institute Email</label>
                          <input
                            name="tenant_email"
                            value={profile.tenant_email || ""}
                            onChange={handleChange}
                            placeholder="Enter institute email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Institute Phone</label>
                          <input
                            name="tenant_phone"
                            value={profile.tenant_phone || ""}
                            onChange={handleChange}
                            placeholder="Enter institute phone"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={saveProfile}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 shadow-md hover:shadow-lg transition-all duration-200"
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

export default AdminProfile
