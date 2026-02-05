import axios from "axios";
import { getAuth } from "firebase/auth";

const API_BASE_URL = process.env.EXPO_PUBLIC_URL;
console.log("API_BASE_URL:", API_BASE_URL);

/**
 * Single Axios instance for the app
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 15000,
});

/**
 * Inject Firebase token into every request
 */
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    console.log("🟢 Axios attaching token:", token.substring(0, 20));
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log("🔴 Axios request without user");
  }

  return config;
});

/**
 * Handle auth errors globally
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized — user may need to re-login");
    }
    return Promise.reject(error);
  },
);
