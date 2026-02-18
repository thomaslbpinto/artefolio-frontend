import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  AuthResponse,
  SignInData,
  SignUpData,
  GoogleSignUpCompleteData,
  GoogleProfile,
  User,
  ResendCooldownEmail,
  ResendCooldownPasswordReset,
} from '@/types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<() => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosError['config'] & {
          _retry?: boolean;
        };

        const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

        if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push(() => {
                resolve(this.client(originalRequest!));
              });
            });
          }

          if (originalRequest) {
            originalRequest._retry = true;
          }

          this.isRefreshing = true;

          try {
            await this.client.post<AuthResponse>('/auth/refresh-access-token');
            this.refreshSubscribers.forEach((callback) => callback());
            this.refreshSubscribers = [];
            return this.client(originalRequest!);
          } catch {
            window.location.href = '/sign-in';
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  getBaseUrl(): string {
    return API_BASE_URL;
  }

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/sign-in', data);
    return response.data;
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/sign-up', data);
    return response.data;
  }

  async signOut(): Promise<void> {
    await this.client.post('/auth/sign-out');
  }

  async getGooglePendingSignupProfile(): Promise<GoogleProfile | null> {
    const response = await this.client.get<GoogleProfile | null>('/auth/google/pending-signup');
    return response.data;
  }

  async clearGooglePendingSignupProfile(): Promise<void> {
    await this.client.get<void>('/auth/google/clear-pending-signup');
  }

  async getPendingGoogleLinkProfile(): Promise<GoogleProfile | null> {
    const response = await this.client.get<GoogleProfile | null>('/auth/google/pending-link');
    return response.data;
  }

  async clearGooglePendingLinkProfile(): Promise<void> {
    await this.client.get<void>('/auth/google/clear-pending-link');
  }

  async googleSignUpComplete(data: GoogleSignUpCompleteData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/google/sign-up/complete', data);
    return response.data;
  }

  async googleLinkAccount(): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/google/link-account');
    return response.data;
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  async verifyEmailVerificationCode(code: string): Promise<void> {
    const response = await this.client.post<void>('/auth/email/verify-verification-code', { code });
    return response.data;
  }

  async getEmailVerificationResendCooldown(): Promise<ResendCooldownEmail> {
    const response = await this.client.get<ResendCooldownEmail>('/auth/email/resend-cooldown');
    return response.data;
  }

  async resendEmailVerificationEmail(email: string): Promise<void> {
    const response = await this.client.post<void>('/auth/email/resend-verification-email', { email });
    return response.data;
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const response = await this.client.post<void>('/auth/password/reset', { email, code, newPassword });
    return response.data;
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<void> {
    const response = await this.client.post<void>('/auth/password/verify-reset-code', { email, code });
    return response.data;
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const response = await this.client.post<void>('/auth/password/send-reset-email', { email });
    return response.data;
  }

  async getPasswordResetResendCooldown(email: string): Promise<ResendCooldownPasswordReset> {
    const response = await this.client.get<ResendCooldownPasswordReset>('/auth/password/resend-cooldown', {
      params: { email },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
