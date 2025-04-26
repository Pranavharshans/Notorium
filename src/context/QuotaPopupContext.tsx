"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the QuotaPopup component to avoid SSR issues
const QuotaPopup = dynamic(() => import('@/components/ui/QuotaPopup').then(mod => mod.QuotaPopup), { ssr: false });

type QuotaType = 'recording' | 'enhance';

interface QuotaPopupContextProps {
  showQuotaPopup: (type: QuotaType) => void;
}

const QuotaPopupContext = createContext<QuotaPopupContextProps | undefined>(undefined);

export const useQuotaPopup = () => {
  const context = useContext(QuotaPopupContext);
  if (!context) {
    throw new Error('useQuotaPopup must be used within a QuotaPopupProvider');
  }
  return context;
};

interface QuotaPopupProviderProps {
  children: ReactNode;
}

export const QuotaPopupProvider: React.FC<QuotaPopupProviderProps> = ({ children }) => {
  const [popupType, setPopupType] = useState<QuotaType | null>(null);

  const showQuotaPopup = (type: QuotaType) => {
    setPopupType(type);
  };

  const closePopup = () => {
    setPopupType(null);
  };

  return (
    <QuotaPopupContext.Provider value={{ showQuotaPopup }}>
      {children}
      {popupType && (
        <QuotaPopup type={popupType} onClose={closePopup} />
      )}
    </QuotaPopupContext.Provider>
  );
};