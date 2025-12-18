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
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Admin Profile</h1>

      <div className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT: PROFILE IMAGE */}
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
            Upload Image
          </button>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="md:col-span-2">
          {!editing ? (
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Name</p>
                <p className="font-medium">{profile.full_name}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p>{profile.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm">Phone</p>
                  <p>{profile.phone || "—"}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Gender</p>
                  <p>{profile.gender || "—"}</p>
                </div>
              </div>

              <hr />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm">Institute</p>
                  <p>{profile.tenant_name}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className="text-green-600 font-medium">
                    {profile.tenant_status}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Institute Email</p>
                  <p>{profile.tenant_email}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Institute Phone</p>
                  <p>{profile.tenant_phone}</p>
                </div>
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
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <select
                name="gender"
                value={profile.gender || ""}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <div className="grid grid-cols-2 gap-4">
                <input
                  name="tenant_name"
                  value={profile.tenant_name || ""}
                  onChange={handleChange}
                  placeholder="Institute Name"
                  className="input"
                />

                <input
                  name="tenant_email"
                  value={profile.tenant_email || ""}
                  onChange={handleChange}
                  placeholder="Institute Email"
                  className="input"
                />

                <input
                  name="tenant_phone"
                  value={profile.tenant_phone || ""}
                  onChange={handleChange}
                  placeholder="Institute Phone"
                  className="input"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={saveProfile}
                  className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
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

export default AdminProfile
