import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const ADMIN_CREDENTIALS = {
  username: 'bolaadm',
  password: 'bola+1adm'
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: false,
  isAdmin: false,
  signIn: async () => false,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if admin is logged in from localStorage
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      const sessionData = JSON.parse(adminSession);
      if (sessionData.username === ADMIN_CREDENTIALS.username) {
        setIsAdmin(true);
        setUser({ email: 'admin@bolamaisum.com' } as User);
      }
    }
  }, []);

  const signIn = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const adminSession = {
          username,
          timestamp: Date.now()
        };
        
        localStorage.setItem('admin_session', JSON.stringify(adminSession));
        setIsAdmin(true);
        setUser({ email: 'admin@bolamaisum.com' } as User);
        
        toast.success('Login de administrador realizado com sucesso!');
        return true;
      } else {
        toast.error('Credenciais inválidas');
        return false;
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('admin_session');
      setIsAdmin(false);
      setUser(null);
      setSession(null);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);