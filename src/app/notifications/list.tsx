"use client";

import { api } from "@/trpc/react";
import { errorHandler } from "@/utils/errorHandler";
import type { Notification } from "@prisma/client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const router = useRouter();

  const { mutate: read } = api.inbox.markAsRead.useMutation({
    onSuccess: (res) => {
      router.refresh();
      router.push(res.link ?? "/");
    },
    onError: errorHandler,
  });

  return (
    <motion.div>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex items-center justify-between border-b border-gray-200 p-4"
          onClick={() => {
            read({ notificationId: notification.id });
          }}
        >
          <div className="flex items-center">
            {!notification.read && (
              <div className="h-2 w-2 shrink-0 rounded-full bg-sky-500"></div>
            )}
            <div className="ml-4">
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="text-sm text-gray-500">
                {notification.description}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">
              {notification.createdAt.toLocaleDateString("en-in")}
            </p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

export default NotificationList;
