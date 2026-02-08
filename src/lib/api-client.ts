import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  AuthResponse,
  SignInData,
  SignUpData,
  GoogleSignUpCompleteData,
  GoogleProfile,
  User,
} from '@/types/auth.types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

        if (
          error.response?.status === 401 &&
          !originalRequest?._retry &&
          !isAuthEndpoint
        ) {
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
            await this.client.post<AuthResponse>('/auth/refresh');
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
    const response = await this.client.post<AuthResponse>(
      '/auth/sign-in',
      data,
    );
    return response.data;
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      '/auth/sign-up',
      data,
    );
    return response.data;
  }

  async getPendingSignup(): Promise<{ profile: GoogleProfile | null }> {
    const response = await this.client.get<{ profile: GoogleProfile | null }>(
      '/auth/google/pending-signup',
    );
    return response.data;
  }

  async clearPendingSignup(): Promise<void> {
    await this.client.get<{ ok: true }>('/auth/google/clear-pending-signup');
  }

  async clearPendingLink(): Promise<void> {
    await this.client.get<{ ok: true }>('/auth/google/clear-pending-link');
  }

  async getPendingLink(): Promise<{ profile: GoogleProfile | null }> {
    const response = await this.client.get<{ profile: GoogleProfile | null }>(
      '/auth/google/pending-link',
    );
    return response.data;
  }

  async googleSignUpComplete(
    data: GoogleSignUpCompleteData,
  ): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      '/auth/google/sign-up/complete',
      data,
    );
    return response.data;
  }

  async linkGoogleAccount(): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      '/auth/google/link-account',
    );
    return response.data;
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      '/auth/verify-email',
      { token },
    );
    return response.data;
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      '/auth/resend-verification-email',
      { email },
    );
    return response.data;
  }
}

export const apiClient = new ApiClient();
