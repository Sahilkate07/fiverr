import axios from "axios";

const newRequest = axios.create({
  baseURL: "http://localhost:8800/api",
  withCredentials: true, // Ensures cookies are sent with requests
});

// Add Authorization header automatically for logged-in users
newRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default newRequest;
