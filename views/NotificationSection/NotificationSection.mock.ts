import { INotificationItem } from "./NotificationSection.model";

export const notifications: INotificationItem[] = [
  {
    id: 1,
    title: "New Message",
    message: "You have received a new message from John.",
    time: "2 minutes ago",
    isRead: false,
  },
  {
    id: 2,
    title: "Update Available",
    message: "A new update is available for your application.",
    time: "1 hour ago",
    isRead: true,
  },
  {
    id: 3,
    title: "System Alert",
    message: "Your subscription will expire in 3 days.",
    time: "Yesterday",
    isRead: false,
  },
];
