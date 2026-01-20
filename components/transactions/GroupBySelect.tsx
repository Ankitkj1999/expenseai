'use client';

import * as React from 'react';
import { Layers } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type GroupByOption = 'none' | 'date' | 'category' | 'account';

interface GroupBySelectProps {
  value: GroupByOption;
  onValueChange: (value: GroupByOption) => void;
}

export function GroupBySelect({ value, onValueChange }: GroupBySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[160px] h-10">
        <Layers className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Group by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No grouping</SelectItem>
        <SelectItem value="date">By Date</SelectItem>
        <SelectItem value="category">By Category</SelectItem>
        <SelectItem value="account">By Account</SelectItem>
      </SelectContent>
    </Select>
  );
}
