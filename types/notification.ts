export type NotificationType =
  | "dose"
  | "missed"
  | "caregiver_alert"
  | "system"
  | "chat";

export interface AppNotification {
  _id: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}
