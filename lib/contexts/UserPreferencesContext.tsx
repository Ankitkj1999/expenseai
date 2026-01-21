'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { authApi } from '@/lib/api/auth';
import { useAuth } from './AuthContext';
import type { IUser } from '@/types';

interface UserPreferences {
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark';
  notifications: {
    budgetAlerts: boolean;
    goalReminders: boolean;
    weeklyReports: boolean;
    transactionUpdates: boolean;
    insightNotifications: boolean;
  };
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  isLoading: boolean;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  theme: 'dark',
  notifications: {
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: false,
    transactionUpdates: true,
    insightNotifications: true,
  },
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Derive preferences from user data - no need for separate state
  const preferences = useMemo<UserPreferences>(() => {
    if (!user?.preferences) {
      return defaultPreferences;
    }

    return {
      currency: user.preferences.currency || defaultPreferences.currency,
      dateFormat: user.preferences.dateFormat || defaultPreferences.dateFormat,
      theme: user.preferences.theme || defaultPreferences.theme,
      notifications: {
        ...defaultPreferences.notifications,
        ...user.preferences.notifications,
      },
    };
  }, [user]);

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      await authApi.updatePreferences(newPreferences);
      // Preferences will automatically update when AuthContext refetches user
      // Could trigger a refetch here if needed, but API should return updated user
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  };

  const refreshPreferences = async () => {
    // Preferences automatically sync with user data from AuthContext
    // No separate API call needed
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        isLoading,
        updatePreferences,
        refreshPreferences,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
