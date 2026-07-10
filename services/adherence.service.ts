import { api } from "./api";

export const getAdherenceStats = async () => {
  const res = await api.get("/adherence/stats");
  return res.data.data;
};

export const getAdherence = async (period: string) => {
  return api.get(`/adherence?period=${period}`);
};
