"use client"

import { Notification } from "@prisma/client"
import { motion } from "framer-motion"

function NotificationList({notifications}: {notifications: Notification[]}) {
  return (
  <motion.div>
    {notifications.map((notification) => (
      <div key={notification.id} className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="ml-4">
            <p className="text-sm font-medium">{notification.title}</p>
            <p className="text-sm text-gray-500">{notification.description}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500">{notification.createdAt.toLocaleDateString()}</p>
        </div>
      </div>
    ))}
  </motion.div>
  )
}

export default NotificationList
