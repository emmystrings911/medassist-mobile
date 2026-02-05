import { api } from "./client";

export const getMedications = async () => {
  const res = await api.get("/medications");
  return res.data;
};

export const createMedication = async (data: any) => {
  const res = await api.post("/medications", data);
  return res.data;
};

export const updateMedication = async (id: string, payload: any) => {
  const res = await api.patch(`/medications/${id}`, payload);
  return res.data;
};
