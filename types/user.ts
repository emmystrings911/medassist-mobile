export type UserRole = "patient" | "caregiver" | "doctor" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;

  fcmToken?: string;
  phone?: string;

  isVerified: boolean;
}
