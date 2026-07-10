// services/medication.service.ts
import { api } from "./api";

export const createMedication = async (data: any) => {
  const res = await api.post("/medications", data);
  return res.data;
};
