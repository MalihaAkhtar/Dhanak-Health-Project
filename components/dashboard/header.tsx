"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, LogOut, User } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Notification = {
  id: string
  message: string
  time: string
  type: "patient" | "payment" | "stock"
}

export function Header() {
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const router = useRouter()

  const BACKEND_URL = "http://localhost:5000"

  // ---------------- Fetch notifications from backend ----------------
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/notifications`)
        if (!res.ok) {
          console.error("Failed to fetch notifications:", await res.text())
          return
        }
        const data = await res.json()

        const combined: Notification[] = []

        // ✅ Low stock medicines
        data.lowStockMedicines?.forEach((m: any, i: number) => {
          combined.push({
            id: `stock-${i}`,
            message: `⚠️ Low stock: ${m.name} (${m.quantity} left)`,
            time: new Date().toLocaleString(),
            type: "stock",
          })
        })

        // ✅ Unpaid patients
        data.unpaidPatients?.forEach((p: any, i: number) => {
          combined.push({
            id: `payment-${i}`,
            message: `💰 Unpaid: ${p.name} (MR#: ${p.mrNo}, ₨${p.amount})`,
            time: new Date().toLocaleString(),
            type: "payment",
          })
        })

        setNotifications(combined)
      } catch (err) {
        console.error("Error fetching notifications:", err)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side: Title (🔹 Clickable now) */}
        <div
          className="cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          <h1 className="text-2xl font-bold text-gray-900 hover:text-green-600 transition">
            Dhanak Health Care Center
          </h1>
          <p className="text-sm text-gray-500">Medical Management System</p>
        </div>

        {/* Right side: Notifications + Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              {/* 🔹 Bell size increased */}
             <Bell className="h-5 w-5" /> {notifications.length > 0 && ( <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center"> {notifications.length} </span>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">
                    Recent Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-3 text-sm text-gray-500">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                      >
                        <p className="text-sm text-gray-900">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => setShowNotifications(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => router.push("/dashboard/profile")}
                >
                  <AvatarImage
                    src={user?.profileImage || "/placeholder-user.jpg"}
                  />
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {user?.name || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
