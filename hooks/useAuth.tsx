import { api, setAuthToken } from "@/services/api";
import { registerForPushNotifications } from "@/services/push";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { loginApi, registerApi } from "../services/auth.api";
import { User } from "../types/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (
    email: string,
    password: string,
    name: string,
    role: "patient" | "caregiver"
  ) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // FIX FE-1 — Read token from SecureStore (encrypted), not AsyncStorage
      const token = await SecureStore.getItemAsync("token");
      const storedUser = await SecureStore.getItemAsync("user");

      if (token && storedUser) {
        setAuthToken(token);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Corrupted storage — clear it
      await SecureStore.deleteItemAsync("token").catch(() => {});
      await SecureStore.deleteItemAsync("user").catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // FIX FE-15 — removed console.log({ email, password })
    const response = await loginApi(email, password);

    if (response?.user && response?.token) {
      setUser(response.user);
      setAuthToken(response.token);

      // FIX FE-1 — Store in SecureStore (Keychain/Keystore backed)
      await SecureStore.setItemAsync("token", response.token);
      await SecureStore.setItemAsync("user", JSON.stringify(response.user));

      const pushToken = await registerForPushNotifications();
      if (pushToken) {
        await api.post("/users/push-token", { token: pushToken });
      }
    }

    return response;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: "patient" | "caregiver"
  ) => {
    const response = await registerApi({ email, password, name, role });
    const data = response?.data ?? response;

    if (data?.user && data?.token) {
      setUser(data.user);
      setAuthToken(data.token);

      // FIX FE-1 — SecureStore
      await SecureStore.setItemAsync("token", data.token);
      await SecureStore.setItemAsync("user", JSON.stringify(data.user));
    }

    return data;
  };

  // FIX FE-11 — logout clears in-memory state, SecureStore, and axios header
  const logout = async () => {
    setUser(null);
    setAuthToken(null);
    await SecureStore.deleteItemAsync("token").catch(() => {});
    await SecureStore.deleteItemAsync("user").catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
