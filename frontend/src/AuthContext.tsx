import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import { authAPI, userAPI } from './services/apiService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (nombre: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in by checking for token
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch current user from backend
      authAPI.getCurrentUser()
        .then(response => {
          setUser(response.user);
        })
        .catch(() => {
          // Token is invalid, remove it
          localStorage.removeItem('token');
        });
    }
  }, []);

  const register = async (nombre: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.register(nombre, email, password);

      // Save token
      localStorage.setItem('token', response.token);

      // Set user
      setUser(response.user);

      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);

      // Save token
      localStorage.setItem('token', response.token);

      // Set user
      setUser(response.user);

      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;

      const response = await userAPI.updateProfile(updates);

      // Update user state
      setUser(response.user);

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
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
