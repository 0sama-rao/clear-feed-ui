import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import api from '../lib/api';

interface UserIndustry {
  id: string;
  name: string;
  slug: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  onboarded: boolean;
  industry: UserIndustry | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  onboarded: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setOnboarded: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboarded, setOnboardedState] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    const storedOnboarded = localStorage.getItem('onboarded');
    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
      setOnboardedState(storedOnboarded === 'true');
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    // Use backend's onboarded flag as source of truth
    const isOnboarded = data.user.onboarded === true;
    localStorage.setItem('onboarded', String(isOnboarded));
    setOnboardedState(isOnboarded);
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post('/api/auth/register', {
      name,
      email,
      password,
    });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    // New users — backend returns onboarded: false
    const isOnboarded = data.user.onboarded === true;
    localStorage.setItem('onboarded', String(isOnboarded));
    setUser(data.user);
    setOnboardedState(isOnboarded);
  }

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('onboarded');
    setUser(null);
    setOnboardedState(false);
  }

  function setOnboarded(val: boolean) {
    localStorage.setItem('onboarded', String(val));
    setOnboardedState(val);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, onboarded, login, register, logout, setOnboarded }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
