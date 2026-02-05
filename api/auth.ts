import { api } from "./client";

export const syncUserWithBackend = async (
  token: string,
  p0: { name: string; email: string | null; provider: string },
) => {
  const res = await api.post(
    "/auth/sync",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
};
