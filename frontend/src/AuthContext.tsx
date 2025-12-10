import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import { API_URL } from './config';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (nombre: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const register = async (nombre: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: nombre,
          email,
          password
        }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      const { token, user } = data;

      // Map backend user to frontend user type if needed
      const frontendUser: User = {
        id: user.id,
        nombre: user.full_name,
        email: user.email,
        fecha_registro: user.created_at || new Date().toISOString(),
        foto_perfil: user.profile_picture_url,
        apodo: user.nickname,
        preferencia_nombre: user.name_preference,
        nombre_asistente: user.assistant_name
      };

      setToken(token);
      setUser(frontendUser);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(frontendUser));

      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      const { token, user } = data;

      const frontendUser: User = {
        id: user.id,
        nombre: user.full_name,
        email: user.email,
        fecha_registro: user.created_at || new Date().toISOString(),
        foto_perfil: user.profile_picture_url,
        apodo: user.nickname,
        preferencia_nombre: user.name_preference,
        nombre_asistente: user.assistant_name
      };

      setToken(token);
      setUser(frontendUser);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(frontendUser));

      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    // TODO: Implement backend update profile endpoint
    // For now, just update local state
    if (!user) return false;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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
