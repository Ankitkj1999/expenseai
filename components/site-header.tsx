"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { ChatInterface } from "@/components/ai/ChatInterface"

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
  const [chatOpen, setChatOpen] = useState(false)
  
  // Keyboard shortcut: Cmd/Ctrl+K to open chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setChatOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">{pageTitle}</h1>
          
          {/* AI Chat Button */}
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChatOpen(true)}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">AI Assistant</span>
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Chat Interface */}
      <ChatInterface open={chatOpen} onOpenChange={setChatOpen} />
    </>
  )
}
