"use client";

import { api } from "@/trpc/react";
import { errorHandler } from "@/utils/errorHandler";
import type { Notification } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const { mutate: deleteNotification } = api.inbox.delete.useMutation();

  const [all, setAll] = useState<Notification[]>(notifications);

  const deleteThis = (id: string) => {
    setAll(prev => prev.filter(n => n.id !== id));
    deleteNotification({ notificationId: id });
  }

  if (all.length == 0) {
    return <div className="h-52 flex items-center justify-center">No Notifications...</div>
  }

  return (
    <AnimatePresence mode="popLayout">
      <div>
        {all.map((notification) => (
          <motion.li
            key={notification.id}
            layout
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center justify-between border-b border-gray-200 p-4"
            onClick={() => {
              read({ notificationId: notification.id });
            }}
          >
            <div className="relative flex items-center">
              {!notification.read &&
                <div className="absolute top-1/2 -left-4 h-2 w-2 shrink-0 rounded-full bg-sky-500"></div>}
              <div>
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-sm text-gray-500">
                  {notification.description}
                </p>
              </div>
            </div>
            <p className="flex flex-col items-end text-sm text-gray-500">
              <X className="w-4 h-4 m-1" onClick={(e) => {
                e.stopPropagation();
                deleteThis(notification.id)
              }} />
              {notification.createdAt.toLocaleDateString("en-in")}
            </p>
          </motion.li>
        ))}
      </div>
    </AnimatePresence>
  );
}

export default NotificationList;
