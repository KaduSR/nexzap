// cspell: disable
import axios, { AxiosInstance } from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const api: AxiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

export default api;
