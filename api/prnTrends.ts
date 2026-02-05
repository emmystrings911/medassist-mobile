// api/prnTrends.ts
import { api } from "./client";

export const getWeeklyPrnTrends = async (medicationId: string) => {
  const res = await api.get(`/medications/${medicationId}/prn-trends/weekly`);
  return res.data;
};

export const getMonthlyPrnTrends = async (medicationId: string) => {
  const res = await api.get(`/medications/${medicationId}/prn-trends/monthly`);
  return res.data;
};
