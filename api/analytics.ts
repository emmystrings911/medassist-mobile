import { api } from "./client";

export const getWeeklyAdherence = async () => {
  const res = await api.get("/analytics/weekly");
  return res.data;
};

export const getMonthlyAdherence = async () => {
  const res = await api.get("/analytics/monthly");
  return res.data;
};

export const getAdherence = async (range: "week" | "month") => {
  const res = await api.get(`/analytics/adherence?range=${range}`);
  return res.data;
};

export const getWeeklyChart = async () => {
  const res = await api.get("/analytics/weekly-chart");
  return res.data;
};

export const getStreak = async () => {
  const res = await api.get("/analytics/streak");
  return res.data;
};

export const getMonthlyAdherenceChart = async () => {
  const res = await api.get("/analytics/monthly-chart");
  return res.data;
};
