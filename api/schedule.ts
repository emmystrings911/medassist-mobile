import { api } from "./client";

export const getSchedules = async () => {
  const res = await api.get("/schedules");
  return res.data;
};
