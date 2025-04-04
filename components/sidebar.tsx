"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, BookOpen, GraduationCap, Award, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  role: "admin" | "lecturer"
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const adminLinks = [
    {
      href: "/admin-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin-dashboard/lecturers",
      label: "Manage Lecturers",
      icon: Users,
    },
    {
      href: "/admin-dashboard/lecturers/add",
      label: "Add Lecturer",
      icon: Users,
    },
    {
      href: "/admin-dashboard/lecturers/view",
      label: "View Lecturers",
      icon: Users,
    },
    {
      href: "/admin-dashboard/subjects/manage",
      label: "Manage Subjects",
      icon: BookOpen,
    },
    {
      href: "/admin-dashboard/subjects",
      label: "Grading Table",
      icon: GraduationCap,
    },
    {
      href: "/admin-dashboard/assignments",
      label: "Subject Assignments",
      icon: Award,
    },
  ]

  const lecturerLinks = [
    {
      href: "/lecturer-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/lecturer-dashboard/subjects",
      label: "My Subjects",
      icon: BookOpen,
    },
  ]

  const links = role === "admin" ? adminLinks : lecturerLinks

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-[hsl(var(--sidebar-background))] transition-all duration-300",
        collapsed ? "w-16" : "w-[var(--sidebar-width)]",
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">Grading System</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-sidebar-active"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu /> : <X />}
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("sidebar-link", pathname === link.href && "active", collapsed && "justify-center px-2")}
            >
              <link.icon className="h-5 w-5" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

