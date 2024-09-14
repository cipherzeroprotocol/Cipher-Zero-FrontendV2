import { notifications } from "./NotificationSection.mock";
import { BellIcon, CheckCircleIcon } from "lucide-react";

export default function NotificationList() {
  return (
    <ul>
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className={`flex items-center justify-between py-4 px-3 border-b border-t border-secondary ${
            notification.isRead ? "bg-white" : "bg-blue-50"
          }`}
        >
          <div className="flex items-center space-x-4">
            <BellIcon className="h-6 w-6 text-gray-500" />
            <div>
              <p className="font-medium text-gray-800">{notification.title}</p>
              <p className="text-gray-600 text-sm">{notification.message}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-gray-400 text-sm">{notification.time}</p>
            {notification.isRead ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
