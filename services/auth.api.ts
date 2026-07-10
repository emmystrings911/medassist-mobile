import { User } from "../types/user";
import { api } from "./api";

interface AuthResponse {
  user: User;
  token: string;
}

export const loginApi = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const res = await api.post("/auth/login", { email, password });

  // Use the nested data from backend
  const { data } = res.data; // <-- notice res.data.data
  return data; // returns { user, token }
};

export const registerApi = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<AuthResponse> => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const verifyOtp = (data: { email: string; otp: string; type: string }) =>
  api.post("/auth/otp/verify", data);

export const resendOtp = (data: { email: string; type: string }) =>
  api.post("/auth/otp/resend", data);

export const forgotPassword = (data: { email: string }) =>
  api.post("/auth/forgot-password", data);

export const resetPassword = (data: { email: string; newPassword: string }) =>
  api.post("/auth/reset-password", data);
