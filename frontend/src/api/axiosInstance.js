import React from 'react'
import axios from 'axios'

const API_BASE = "http://localhost:8000/api/";

const axiosInstance = axios.create({
    baseURL: API_BASE,
    withCredentials: true,      //include cookies in request
    headers: {
        "Content-Type":"application/json",
    },
})

axiosInstance.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      
      const path = window.location.pathname;

      // All login-related paths
      const loginPaths = [
        "/",
        "/admin/login",
        "/teacher/login",
        "/student/login",
        "/superadmin/login",
      ];
      
      if (!loginPaths.includes(path)) {
        window.location.href = "/";
      }
    }
    return Promise.reject(err);
  }
);


export default axiosInstance