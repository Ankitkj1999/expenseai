'use client';

import { useState } from 'react';
import { useAccounts, useDeleteAccount } from '@/lib/hooks/useAccounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Wallet, CreditCard, Building2, Trash2, Edit, TrendingUp, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { AccountSheet } from '@/components/forms/AccountSheet';
import type { Account } from '@/lib/api/accounts';

const accountIcons = {
  cash: Wallet,
  bank: Building2,
  credit: CreditCard,
  wallet: Wallet,
};

export default function AccountsPage() {
  const { data: accounts = [], isLoading, error } = useAccounts();
  const deleteAccountMutation = useDeleteAccount();
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteAccountMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const activeAccounts = accounts.filter((a) => a.isActive);
  const totalBalance = activeAccounts.reduce((sum, a) => sum + a.balance, 0);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load accounts. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold md:text-3xl">Accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Manage your cash, bank accounts, credit cards, and wallets
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <>
          {/* Summary Cards Skeleton */}
          <div className="px-4 lg:px-6">
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
          {/* Account Cards Skeleton */}
          <div className="px-4 lg:px-6">
            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && accounts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Wallet className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No accounts yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Create your first account to start tracking your finances across different sources. Use the + button below to get started.
          </p>
        </div>
      )}

      {/* Summary Cards - Top Section */}
      {!isLoading && accounts.length > 0 && (
        <div className="px-4 lg:px-6">
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {/* Total Balance Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalBalance, 'INR')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all active accounts
                </p>
              </CardContent>
            </Card>

            {/* Active Accounts Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAccounts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {accounts.length - activeAccounts.length} inactive
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Accounts Grid */}
      {!isLoading && accounts.length > 0 && (
        <div className="px-4 lg:px-6">
          <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {accounts.map((account) => {
              const Icon = accountIcons[account.type];
              return (
                <Card
                  key={account._id}
                  className="group relative transition-all hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-transform group-hover:scale-105">
                          <Icon className="h-5 w-5" style={{ color: account.color }} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{account.name}</CardTitle>
                          <CardDescription className="text-xs capitalize">
                            {account.type}
                          </CardDescription>
                        </div>
                      </div>
                      {!account.isActive && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Balance */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(account.balance, account.currency)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8"
                          onClick={() => setEditingAccount(account)}
                        >
                          <Edit className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3"
                          onClick={() => handleDelete(account._id, account.name)}
                          disabled={deleteAccountMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button with Sheet */}
      <AccountSheet
        mode="create"
        trigger={<FloatingActionButton ariaLabel="Add new account" />}
      />

      {/* Edit Account Sheet */}
      <AccountSheet
        mode="edit"
        initialData={editingAccount || undefined}
        trigger={<div />}
        open={!!editingAccount}
        onOpenChange={(open) => {
          if (!open) setEditingAccount(null);
        }}
      />
    </div>
  );
}
