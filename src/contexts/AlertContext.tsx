import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AlertContextType {
  successMessage: string;
  errorMessage: string;
  setSuccessMessage: (message: string) => void;
  setErrorMessage: (message: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <AlertContext.Provider value={{ successMessage, errorMessage, setSuccessMessage, setErrorMessage }}>
      {children}
    </AlertContext.Provider>
  );
};
