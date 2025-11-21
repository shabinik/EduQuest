import React from 'react'
import axios from 'axios'

const API_BASE = "http://localhost:8000/api/";

const axiosInstance = axios.create({
    baseURL: API_BASE,
    withCredentials: true,      //include cookies in request
    headers: {
        "content-Type":"application/json",
    },
})



export default axiosInstance