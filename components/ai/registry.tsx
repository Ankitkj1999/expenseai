import { SpendingSummary } from './SpendingSummary';
import { CategoryBreakdown } from './CategoryBreakdown';
import { TransactionList } from './TransactionList';
import { BudgetOverview } from './BudgetOverview';
import { AccountsCard } from './AccountsCard';
import React, { ComponentType } from 'react';

// Define a type for the component props to ensure type safety
// Using 'any' here for flexibility as different components have different props,
// but in a stricter setup, we could use a union type of all prop interfaces.
type ComponentProps = any;

interface RegistryItem {
  component: ComponentType<ComponentProps>;
  loadingText: string;
}

// Map tool names to their respective components and loading messages
export const componentRegistry: Record<string, RegistryItem> = {
  getSpendingSummary: {
    component: SpendingSummary,
    loadingText: 'Calculating spending summary...',
  },
  getCategoryBreakdown: {
    component: CategoryBreakdown,
    loadingText: 'Analyzing spending categories...',
  },
  getTransactions: {
    component: TransactionList,
    loadingText: 'Fetching transactions...',
  },
  getBudgetStatus: {
    component: BudgetOverview,
    loadingText: 'Checking budget status...',
  },
  getAccounts: {
    component: AccountsCard,
    loadingText: 'Retrieving account details...',
  },
  createTransaction: {
    component: () => null, // No visual component for this action yet, just text response
    loadingText: 'Creating transaction...',
  },
};

/**
 * Helper to check if a tool has a registered visual component
 */
export function hasVisualComponent(toolName: string): boolean {
  // We check if it exists and excludes createTransaction which is currently null/placeholder
  return !!componentRegistry[toolName] && toolName !== 'createTransaction';
}

/**
 * Helper to get loading text for a tool
 */
export function getLoadingText(toolName: string): string {
  return componentRegistry[toolName]?.loadingText || `Using ${toolName}...`;
}
