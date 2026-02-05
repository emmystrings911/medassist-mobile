import { api } from "./client";

export const getDoseHistory = async () => {
  const res = await api.get("/dose-logs");
  return res.data;
};

export const markDoseTaken = async (id: string) => {
  const res = await api.patch(`/dose-logs/${id}/taken`);
  return res.data;
};

export const logPrnDose = async (medicationId: string) => {
  const res = await api.post("/logs/prn", { medicationId });
  return res.data;
};

export const snoozeDose = (doseLogId: string, minutes: number) => {
  return api.patch(`/doselogs/${doseLogId}/snooze`, {
    minutes,
  });
};

export const takeNowDose = async ({
  medicationId,
  scheduleId,
}: {
  medicationId: string;
  scheduleId?: string;
}) => {
  const res = await api.post("/logs/take-now", {
    medicationId,
    scheduleId,
  });

  return res.data;
};
