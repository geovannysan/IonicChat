/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { ChatItem } from '../stores/useTicketsChat';
import type { Message } from '../types';

interface AuthContextType {
  loading: boolean;
  user: any;
  setUser: (data: any) => void;
  isAuth: boolean;
  handleLogin: (data: any) => Promise<void>;
  handleLogout: () => Promise<void>;
  handleCuenta: (id: number, cuentaId: string) => Promise<void>;
  socket: any;
  ticketChats: ChatItem;
  setTicketChats: (data: ChatItem) => void;
  messagesState: Message[];
  setMessagesState: React.Dispatch<React.SetStateAction<Message[]>>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authData = useAuth();

  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
