
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  loading: false,
  signIn: async () => false,
  signOut: () => {}
});

const ADMIN_USERNAME = 'bolaadm';
const ADMIN_PASSWORD = 'bola+1adm';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const signIn = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const signOut = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
