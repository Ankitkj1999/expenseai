"use client"

import * as React from "react"
import {
  IconLayoutDashboard,
  IconReceipt,
  IconWallet,
  IconChartPie,
  IconRepeat,
  IconTarget,
  IconSettings,
} from "@tabler/icons-react"

import { Logo } from "@/components/Logo"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { InstallButton } from "@/components/pwa"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/contexts/AuthContext"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: IconReceipt,
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: IconWallet,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconChartPie,
    },
    {
      title: "Budgets",
      url: "/budgets",
      icon: IconTarget,
    },
    {
      title: "Recurring",
      url: "/recurring",
      icon: IconRepeat,
    },
  ];

  const navSecondary = [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ];

  const userData = {
    name: user?.email?.split('@')[0] || "User",
    email: user?.email || "user@example.com",
    avatar: "/avatars/user.jpg",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <div className="relative">
                  <Logo className="!size-5" />
                  <div className="absolute inset-0 blur-xl bg-primary/30 group-hover:bg-primary/50 transition-all" />
                </div>
                <span className="text-base font-semibold">ExpenseAI</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <div className="px-2 py-2">
          <InstallButton />
        </div>
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
