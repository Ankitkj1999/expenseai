'use client';

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { AuthGuard } from "@/components/auth/AuthGuard"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function DashboardPage() {
  // TODO: Fetch real transaction data from API
  const recentTransactions = [
    {
      id: 1,
      header: "Coffee Shop",
      type: "Food & Dining",
      status: "Expense",
      target: "$5.00",
      limit: "Today",
      reviewer: "Cash",
    },
    {
      id: 2,
      header: "Salary",
      type: "Income",
      status: "Income",
      target: "$5,000.00",
      limit: "Today",
      reviewer: "Bank Account",
    },
    {
      id: 3,
      header: "Grocery Store",
      type: "Food & Dining",
      status: "Expense",
      target: "$120.00",
      limit: "Yesterday",
      reviewer: "Credit Card",
    },
    {
      id: 4,
      header: "Uber",
      type: "Transportation",
      status: "Expense",
      target: "$15.00",
      limit: "Yesterday",
      reviewer: "Debit Card",
    },
    {
      id: 5,
      header: "Freelance Project",
      type: "Income",
      status: "Income",
      target: "$1,200.00",
      limit: "2 days ago",
      reviewer: "Bank Account",
    },
  ];

  return (
    <AuthGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Summary Cards */}
                <SectionCards />
                
                {/* Spending Trend Chart */}
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                
                {/* Recent Transactions Table */}
                <DataTable data={recentTransactions} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
