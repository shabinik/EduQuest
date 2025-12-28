import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-4 relative overflow-hidden">
      {/* School themed background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-white text-6xl">📚</div>
        <div className="absolute top-20 right-20 text-white text-5xl">🎓</div>
        <div className="absolute bottom-20 left-20 text-white text-5xl">✏️</div>
        <div className="absolute bottom-10 right-10 text-white text-6xl">📖</div>
        <div className="absolute top-1/2 left-1/4 text-white text-4xl">🎒</div>
        <div className="absolute top-1/3 right-1/3 text-white text-5xl">🏫</div>
        <div className="absolute bottom-1/3 right-1/4 text-white text-4xl">📝</div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
                🎓
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Welcome to EduQuest</h1>
            <p className="text-indigo-100 text-lg">Choose your role to access the platform</p>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            {/* Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Student Card */}
              <button
                onClick={() => navigate('/student/login')}
                className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-indigo-200 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 text-left"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                    👨‍🎓
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Student</h3>
                    <p className="text-gray-600 text-sm">Access your courses, assignments, and learning materials</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </button>

              {/* Teacher Card */}
              <button
                onClick={() => navigate('/teacher/login')}
                className="group relative bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border-2 border-emerald-200 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 text-left"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                    👨‍🏫
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Teacher</h3>
                    <p className="text-gray-600 text-sm">Manage classes, create content, and track student progress</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </button>

              {/* School Admin Card */}
              <button
                onClick={() => navigate('/admin/login')}
                className="group relative bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 text-left"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                    🏫
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">School Admin</h3>
                    <p className="text-gray-600 text-sm">Oversee school operations, manage staff and student data</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </button>

              {/* Super Admin Card */}
              <button
                onClick={() => navigate('/superadmin/login')}
                className="group relative bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border-2 border-orange-200 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 text-left"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Super Admin</h3>
                    <p className="text-gray-600 text-sm">Platform-wide administration and system management</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </button>
            </div>

            {/* Info Section */}
            <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <p className="text-gray-700 text-sm">
                    <strong className="text-gray-800">Need help?</strong> If you belong to a school, use the School Admin portal. 
                    Teachers and students should select their respective roles to access personalized dashboards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 text-center border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Don't have an account? <a href="/admin/signup" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition">Sign up as School Admin</a>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-300 text-xs mt-6">
          © 2025 EduQuest. All rights reserved.
        </p>
      </div>
    </div>
  );
}