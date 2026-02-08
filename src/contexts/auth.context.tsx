import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { apiClient } from '@/lib/api-client';
import type {
  User,
  SignInData,
  SignUpData,
  GoogleSignUpCompleteData,
} from '@/types/auth.types';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  googleSignUpComplete: (data: GoogleSignUpCompleteData) => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await apiClient.getMe();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (data: SignInData) => {
    const response = await apiClient.signIn(data);
    setUser(response.user);
  };

  const signUp = async (data: SignUpData) => {
    const response = await apiClient.signUp(data);
    setUser(response.user);
  };

  const googleSignUpComplete = async (data: GoogleSignUpCompleteData) => {
    const response = await apiClient.googleSignUpComplete(data);
    setUser(response.user);
  };

  const linkGoogleAccount = async () => {
    const response = await apiClient.linkGoogleAccount();
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await apiClient.getMe();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        googleSignUpComplete,
        linkGoogleAccount,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
