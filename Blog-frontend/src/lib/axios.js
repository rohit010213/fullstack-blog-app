import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  withCredentials: true, // Ensures cookies are sent with requests
});

// Debugging: Print Base URL
console.log("Axios Base URL:", axiosInstance.defaults.baseURL);
