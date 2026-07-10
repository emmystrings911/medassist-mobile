import axios from "axios";

// FIX FE-6 — URL comes exclusively from env var; no hardcoded IP fallback.
// Set EXPO_PUBLIC_BASE_URL in your .env and .env.production files.
const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

if (!API_BASE_URL && __DEV__) {
  console.warn("⚠️  EXPO_PUBLIC_BASE_URL is not set. API calls will fail.");
}

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// FIX FE-15 — Removed console.log("API Base URL:", API_BASE_URL)

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// FIX FE-17 — Auto-logout when token expires (401 response)
// Import is lazy to avoid circular dependency with useAuth
export const setupAuthInterceptor = (logoutFn: () => Promise<void>) => {
  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        await logoutFn();
      }
      return Promise.reject(error);
    }
  );
};
