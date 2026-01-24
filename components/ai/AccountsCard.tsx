'use client';

import { Wallet, CreditCard, Building } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

interface AccountsCardProps {
  accounts: Account[];
  count: number;
  currency: string;
}

export function AccountsCard({ accounts, count, currency }: AccountsCardProps) {
  if (!accounts.length) {
    return (
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
          <h3 className="font-semibold">Your Accounts</h3>
          <span className="text-xs text-muted-foreground">0 found</span>
        </div>
        <div className="p-6 text-center text-muted-foreground">
          No accounts found.
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bank': return <Building className="h-5 w-5" />;
      case 'card': return <CreditCard className="h-5 w-5" />;
      case 'wallet': return <Wallet className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <h3 className="font-semibold">Your Accounts</h3>
        <span className="text-xs text-muted-foreground">{count} found</span>
      </div>
      
      {/* Total Balance Header */}
      <div className="p-4 bg-primary/5 border-b">
        <p className="text-sm text-muted-foreground">Total Balance</p>
        <p className="text-2xl font-bold">{currency}{totalBalance.toLocaleString()}</p>
      </div>

      <div className="divide-y max-h-[300px] overflow-y-auto">
        {accounts.map((account) => (
          <div key={account.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                {getIcon(account.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate" title={account.name}>{account.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
              </div>
            </div>
            <div className="font-semibold shrink-0">
              {currency}{account.balance.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
