'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/client';
import type { AccountResponse } from '@/types';
import { Wallet, Building2, CreditCard, PiggyBank } from 'lucide-react';

// Icon mapping for account types
const ACCOUNT_TYPE_ICONS = {
  cash: Wallet,
  bank: Building2,
  credit: CreditCard,
  wallet: Wallet,
  savings: PiggyBank,
} as const;

interface AccountSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  excludeAccountId?: string; // For transfer: exclude the source account
}

export function AccountSelect({
  value,
  onValueChange,
  placeholder = 'Select account',
  disabled = false,
  excludeAccountId,
}: AccountSelectProps) {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        setIsLoading(true);
        const response = await api.get<{ data: { accounts: AccountResponse[] } }>(
          'accounts'
        );
        let accs = response.data.data.accounts.filter(acc => acc.isActive);
        
        // Exclude specific account if provided (for transfers)
        if (excludeAccountId) {
          accs = accs.filter(acc => acc._id !== excludeAccountId);
        }
        
        setAccounts(accs);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccounts();
  }, [excludeAccountId]);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => {
          const IconComponent = ACCOUNT_TYPE_ICONS[account.type];
          
          return (
            <SelectItem key={account._id} value={account._id}>
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" style={{ color: account.color }} />
                  <span>{account.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {account.currency} {account.balance.toFixed(2)}
                </span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
