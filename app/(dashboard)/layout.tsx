'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { QuickCreateProvider, useQuickCreate } from '@/lib/contexts/QuickCreateContext';
import { TransactionDialog } from '@/components/forms/TransactionDialog';
import { BudgetSheet } from '@/components/forms/BudgetSheet';
import { AccountSheet } from '@/components/forms/AccountSheet';
import { RecurringTransactionSheet } from '@/components/forms/RecurringTransactionSheet';

function QuickCreateForms() {
  const { activeForm, closeForm } = useQuickCreate();

  return (
    <>
      {/* Transaction Dialog */}
      <TransactionDialog
        mode="create"
        trigger={<div />}
        open={activeForm === 'transaction'}
        onOpenChange={(open: boolean) => !open && closeForm()}
      />

      {/* Budget Sheet */}
      <BudgetSheet
        mode="create"
        trigger={<div />}
        open={activeForm === 'budget'}
        onOpenChange={(open) => !open && closeForm()}
      />

      {/* Account Sheet */}
      <AccountSheet
        mode="create"
        trigger={<div />}
        open={activeForm === 'account'}
        onOpenChange={(open) => !open && closeForm()}
      />

      {/* Recurring Transaction Sheet */}
      <RecurringTransactionSheet
        mode="create"
        trigger={<div />}
        open={activeForm === 'recurring'}
        onOpenChange={(open) => !open && closeForm()}
      />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <QuickCreateProvider>
        <SidebarProvider
          style={
            {
              '--sidebar-width': 'calc(var(--spacing) * 72)',
              '--header-height': 'calc(var(--spacing) * 12)',
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main mx-auto flex w-full max-w-[1920px] flex-1 flex-col gap-2">
                {children}
              </div>
            </div>
          </SidebarInset>
          <QuickCreateForms />
        </SidebarProvider>
      </QuickCreateProvider>
    </AuthGuard>
  );
}
