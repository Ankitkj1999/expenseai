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
}

export function AccountsCard({ accounts, count }: AccountsCardProps) {
  if (!accounts.length) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
        No accounts found.
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
  // Assuming all accounts use the same currency for total, or just taking the first one's currency symbol for simplicity
  const currencySymbol = accounts[0]?.currency || '$'; 

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <h3 className="font-semibold">Your Accounts</h3>
        <span className="text-xs text-muted-foreground">{count} found</span>
      </div>
      
      {/* Total Balance Header */}
      <div className="p-4 bg-primary/5 border-b">
        <p className="text-sm text-muted-foreground">Total Balance</p>
        <p className="text-2xl font-bold">{currencySymbol}{totalBalance.toLocaleString()}</p>
      </div>

      <div className="divide-y max-h-[300px] overflow-y-auto">
        {accounts.map((account) => (
          <div key={account.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                {getIcon(account.type)}
              </div>
              <div>
                <p className="font-medium text-sm">{account.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
              </div>
            </div>
            <div className="font-semibold">
              {account.currency}{account.balance.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
