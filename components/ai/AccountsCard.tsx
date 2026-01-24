'use client';

import { AIComponentCard } from './AIComponentCard';

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
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bank': return <Building className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'wallet': return <Wallet className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  return (
    <AIComponentCard
      title="Your Accounts"
      subtitle={`${count} accounts`}
      isEmpty={accounts.length === 0}
      emptyMessage="No accounts found."
    >
      <div className="bg-primary/5 p-4 flex flex-col items-center justify-center border-b border-primary/10">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Net Worth</p>
        <p className="text-3xl font-bold tracking-tight text-primary">
          {currency}{totalBalance.toLocaleString()}
        </p>
      </div>

      <div className="divide-y max-h-[320px] overflow-y-auto">
        {accounts.map((account) => (
          <div key={account.id} className="p-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4 group">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {getIcon(account.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate text-foreground group-hover:text-primary transition-colors" title={account.name}>
                  {account.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
              </div>
            </div>
            <div className="font-semibold shrink-0 text-sm tabular-nums">
              {currency}{account.balance.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </AIComponentCard>
  );
}
