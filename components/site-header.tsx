"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const getPageTitle = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  
  if (!lastSegment || lastSegment === 'dashboard') return 'Dashboard'
  
  // Capitalize first letter and handle special cases
  const titleMap: Record<string, string> = {
    'transactions': 'Transactions',
    'analytics': 'Analytics',
    'budgets': 'Budgets',
    'accounts': 'Accounts',
    'recurring': 'Recurring Transactions',
  }
  
  return titleMap[lastSegment] || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
}

export function SiteHeader() {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
      </div>
    </header>
  )
}
