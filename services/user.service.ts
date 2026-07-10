import { api } from "./api";

export const getProfile = async () => {
  return api.get("/users/me");
};

export const updateProfile = async (data: any) => {
  return api.put("/users/me", data);
};

export const uploadProfileImage = async (base64: string) => {
  return api.post("/upload/profile-image", { image: base64 });
};

export const savePushToken = async (token: string) => {
  return api.post("/users/push-token", { token });
};

export const changePassword = async (data: {
  oldPassword: string;
  newPassword: string;
}) => {
  return api.patch("/users/change-password", data);
};
