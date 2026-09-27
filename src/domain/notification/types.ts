export interface AutomotiveNotification {
  id: string;
  app: string;
  sender: string;
  message: string;
  time: string;
  category: "message" | "system" | "navigation" | "call";
  icon?: string;
}
