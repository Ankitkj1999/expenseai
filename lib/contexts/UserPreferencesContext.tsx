'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
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
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  const loadPreferences = async () => {
    try {
      const user = await authApi.me();
      if (user?.preferences) {
        setPreferences({
          currency: user.preferences.currency || defaultPreferences.currency,
          dateFormat: user.preferences.dateFormat || defaultPreferences.dateFormat,
          theme: user.preferences.theme || defaultPreferences.theme,
          notifications: {
            ...defaultPreferences.notifications,
            ...user.preferences.notifications,
          },
        });
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      await authApi.updatePreferences(newPreferences);
      setPreferences((prev) => ({
        ...prev,
        ...newPreferences,
        notifications: {
          ...prev.notifications,
          ...(newPreferences.notifications || {}),
        },
      }));
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  };

  const refreshPreferences = async () => {
    setIsLoading(true);
    await loadPreferences();
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
