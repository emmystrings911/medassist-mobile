import { api } from "./api";

export const getTodayDoses = async () => {
  const res = await api.get("/doses/today");
  return res.data.data;
};

export const markDoseTaken = async (doseId: string) => {
  const res = await api.patch(`/doses/${doseId}/take`);
  return res.data.data;
};
