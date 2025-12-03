import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (nombre: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface StoredUser {
  id: string;
  nombre: string;
  email: string;
  password: string;
  fecha_registro: string;
  foto_perfil?: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('emosense_current_user');
    if (currentUser) {
      const userData = JSON.parse(currentUser) as User;
      setUser(userData);
    }
  }, []);

  const register = async (nombre: string, email: string, password: string): Promise<boolean> => {
    try {
      // Get existing users
      const usersJson = localStorage.getItem('emosense_users');
      const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

      // Check if email already exists
      if (users.some(u => u.email === email)) {
        return false;
      }

      // Create new user
      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        nombre,
        email,
        password, // In production, this should be hashed
        fecha_registro: new Date().toISOString(),
      };

      // Save user
      users.push(newUser);
      localStorage.setItem('emosense_users', JSON.stringify(users));

      // Log in the user
      const userWithoutPassword: User = {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        fecha_registro: newUser.fecha_registro,
        foto_perfil: newUser.foto_perfil,
      };

      setUser(userWithoutPassword);
      localStorage.setItem('emosense_current_user', JSON.stringify(userWithoutPassword));

      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usersJson = localStorage.getItem('emosense_users');
      const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

      const foundUser = users.find(u => u.email === email && u.password === password);

      if (!foundUser) {
        return false;
      }

      const userWithoutPassword: User = {
        id: foundUser.id,
        nombre: foundUser.nombre,
        email: foundUser.email,
        fecha_registro: foundUser.fecha_registro,
        foto_perfil: foundUser.foto_perfil,
      };

      setUser(userWithoutPassword);
      localStorage.setItem('emosense_current_user', JSON.stringify(userWithoutPassword));

      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('emosense_current_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
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
