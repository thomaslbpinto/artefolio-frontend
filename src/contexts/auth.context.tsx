import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type {
  User,
  SignInData,
  SignUpData,
  GoogleSignInData,
  GoogleSignUpCompleteData,
} from '@/types/auth.types';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  googleSignIn: (data: GoogleSignInData) => Promise<void>;
  googleSignUpComplete: (data: GoogleSignUpCompleteData) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (token && refreshToken) {
        try {
          const user = await apiClient.getMe();
          setUser(user);
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (data: SignInData) => {
    const response = await apiClient.signIn(data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.user);
  };

  const signUp = async (data: SignUpData) => {
    const response = await apiClient.signUp(data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.user);
  };

  const googleSignIn = async (data: GoogleSignInData) => {
    const response = await apiClient.googleSignIn(data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.user);
  };

  const googleSignUpComplete = async (data: GoogleSignUpCompleteData) => {
    const response = await apiClient.googleSignUpComplete(data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.user);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await apiClient.logout(refreshToken);
      } catch (error) {}
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        googleSignIn,
        googleSignUpComplete,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
