"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Stethoscope, Pill, CreditCard, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Visits", href: "/dashboard/visits", icon: Stethoscope },
  { name: "Medicine Stock", href: "/dashboard/medicines", icon: Pill },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Trash", href: "/dashboard/trash", icon: Trash2 },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn("bg-white shadow-lg transition-all duration-300 flex flex-col", collapsed ? "w-16" : "w-64")}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Image src="/dhanak-logo.jpg" alt="Dhanak Health Care" width={120} height={60} className="object-contain" />
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-lg hover:bg-gray-100">
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
