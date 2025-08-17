'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../lib/types';
import { mockUsers } from '../lib/mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'role' | 'isActive' | 'createdAt'>) => Promise<string>;
  activateAccount: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email && u.isActive);
    
    if (user) {
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    localStorage.removeItem('user');
  };

  const register = async (userData: Omit<User, 'id' | 'role' | 'isActive' | 'createdAt'>): Promise<string> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const referenceCode = `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // In a real app, this would be saved to the database
    console.log('User registered:', { ...userData, referenceCode });
    
    return referenceCode;
  };

  const activateAccount = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email && !u.isActive);
    
    if (user) {
      const updatedUser = { ...user, isActive: true };
      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return true;
    }
    
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        register,
        activateAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
