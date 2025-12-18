import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import { Link } from 'react-router-dom'

function TeacherLogin() {
    const [username,setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const res = await axiosInstance.post('accounts/login/',{username,password})
            const user = res.data.user
            sessionStorage.setItem('user',JSON.stringify(user))

            if (user.role !== 'teacher') {
              setError('This account is not a teacher account.')
              return
            }     

            if (user.must_change_password) {
              navigate('/teacher/change-password')
            } else {
              navigate('/teacher/profile')
            }
            
        } catch (error) {
            console.error(err)
            setError(err.response?.data?.detail || 'Invalid credentials')
        }
    }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-xl mb-4">Teacher Login</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <label>Email</label>
        <input value={username} type="text" onChange={(e) => setUsername(e.target.value)} className="w-full mb-2 p-2 border" />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-2 border" />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>

        <p className="text-sm text-center mt-3">
          Not a teacher? <Link to="/" className="text-blue-500 underline">Back</Link>
        </p>
      </form>
    </div>
  )
}

export default TeacherLogin