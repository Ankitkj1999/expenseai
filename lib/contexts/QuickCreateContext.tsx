'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type FormType = 'transaction' | 'budget' | 'account' | 'recurring' | null;

interface QuickCreateContextType {
  activeForm: FormType;
  openForm: (form: FormType) => void;
  closeForm: () => void;
}

const QuickCreateContext = createContext<QuickCreateContextType | undefined>(undefined);

export function QuickCreateProvider({ children }: { children: ReactNode }) {
  const [activeForm, setActiveForm] = useState<FormType>(null);

  const openForm = (form: FormType) => {
    setActiveForm(form);
  };

  const closeForm = () => {
    setActiveForm(null);
  };

  return (
    <QuickCreateContext.Provider value={{ activeForm, openForm, closeForm }}>
      {children}
    </QuickCreateContext.Provider>
  );
}

export function useQuickCreate() {
  const context = useContext(QuickCreateContext);
  if (context === undefined) {
    throw new Error('useQuickCreate must be used within a QuickCreateProvider');
  }
  return context;
}
