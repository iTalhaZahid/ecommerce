import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api', // Use environment variable or fallback to localhost
  withCredentials: true, // Include cookies in requests
});

export default axiosInstance;
