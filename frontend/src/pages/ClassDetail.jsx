import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import toast from 'react-hot-toast'

function ClassDetail() {
    const { id } = useParams()
    const [cls, setCls] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const navigate = useNavigate()

    useEffect(() => {
        setLoading(true)
        setError("")
        axiosInstance.get(`classroom/class/details/${id}/`)
          .then(res => setCls(res.data))
          .catch((err) => {
            setError("Failed to load class details")
            toast.error("Failed to load class details")
          })
          .finally(() => setLoading(false))
    },[id])

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-gray-500 mt-4">Loading class details...</p>
                </div>
            </div>
        )
    }

    if (error || !cls) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg">
                    <p className="font-semibold mb-2">Error Loading Class</p>
                    <p>{error || "Class not found"}</p>
                    <button
                        onClick={() => navigate('/admin/classes')}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Back to Classes
                    </button>
                </div>
            </div>
        )
    }

    const studentsFilled = cls.current_students || 0
    const maxStudents = cls.max_student || 0
    const fillPercentage = maxStudents > 0 ? (studentsFilled / maxStudents) * 100 : 0

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-8 py-10 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
                    
                    <button
                        onClick={() => navigate('/admin/classes')}
                        className="text-white hover:text-indigo-100 mb-4 flex items-center transition relative z-10"
                    >
                        ← Back to Classes
                    </button>
                    
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-3xl">
                                🎓
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">
                                    Class {cls.name} - {cls.division}
                                </h1>
                                <p className="text-indigo-100 text-lg mt-1">
                                    Academic Year: {cls.academic_year}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Class Teacher Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Class Teacher</p>
                            {cls.class_teacher ? (
                                <div>
                                    <p className="text-xl font-bold text-gray-800 mb-1">
                                        {cls.class_teacher.name}
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center">
                                        <span className="mr-2">📧</span>
                                        {cls.class_teacher.email}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-lg text-gray-400 italic">Not Assigned</p>
                            )}
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                            👨‍🏫
                        </div>
                    </div>
                </div>

                {/* Students Count Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Student Capacity</p>
                            <p className="text-3xl font-bold text-gray-800">
                                {studentsFilled} / {maxStudents}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                            👥
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                            <span>Filled</span>
                            <span>{fillPercentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    fillPercentage >= 90 ? 'bg-red-500' :
                                    fillPercentage >= 75 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                }`}
                                style={{ width: `${fillPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Class Status</p>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-xl font-bold text-green-600">Active</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {maxStudents - studentsFilled} seats available
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                            ✓
                        </div>
                    </div>
                </div>
            </div>

            {/* STUDENTS LIST */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <span className="text-2xl mr-2">👨‍🎓</span>
                            Students List
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {cls.students.length} student{cls.students.length !== 1 ? 's' : ''} enrolled
                        </p>
                    </div>
                    {cls.students.length > 0 && (
                        <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-sm">
                            {cls.students.length} Enrolled
                        </span>
                    )}
                </div>

                {cls.students.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📚</div>
                        <p className="text-gray-500 text-lg font-medium">No students enrolled yet</p>
                        <p className="text-gray-400 text-sm mt-1">Students will appear here once assigned to this class</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Student Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Email Address
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Roll Number
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {cls.students.map((s, index) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {s.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{s.name}</p>
                                                    <p className="text-xs text-gray-500">Student #{index + 1}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-600 text-sm flex items-center">
                                                <span className="mr-2">📧</span>
                                                {s.email}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                                                {s.roll_number}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* QUICK STATS */}
            {cls.students.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-indigo-100">
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <span className="mr-2">📊</span>
                            Class Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Students:</span>
                                <span className="font-semibold text-gray-800">{cls.students.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Available Seats:</span>
                                <span className="font-semibold text-gray-800">{maxStudents - studentsFilled}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Capacity Usage:</span>
                                <span className="font-semibold text-gray-800">{fillPercentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <span className="mr-2">ℹ️</span>
                            Class Information
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Class Name:</span>
                                <span className="font-semibold text-gray-800">{cls.name} - {cls.division}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Academic Year:</span>
                                <span className="font-semibold text-gray-800">{cls.academic_year}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Max Capacity:</span>
                                <span className="font-semibold text-gray-800">{maxStudents} students</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


export default ClassDetail