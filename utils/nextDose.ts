export function getNextDoseTime(
  times: string[],
  startDate: string,
  endDate?: string | null,
) {
  const now = new Date();
  const today = new Date();
  today.setSeconds(0, 0);

  if (endDate && new Date(endDate) < now) {
    return null;
  }

  for (const time of times) {
    const [hours, minutes] = time.split(":").map(Number);

    const doseTime = new Date(today);
    doseTime.setHours(hours, minutes, 0, 0);

    if (doseTime > now && doseTime >= new Date(startDate)) {
      return doseTime;
    }
  }

  return null;
}

export function formatCountdown(target: Date) {
  const diff = target.getTime() - Date.now();

  if (diff <= 0) return "Due now";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  if (hours > 0) {
    return `Next dose in ${hours}h ${minutes}m`;
  }

  return `Next dose in ${minutes}m`;
}
