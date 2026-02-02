import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  AuthResponse,
  SignInData,
  SignUpData,
  GoogleSignInData,
  GoogleSignUpInitiateData,
  GoogleSignUpCompleteData,
  GoogleProfile,
  User,
} from '@/types/auth.types';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add access token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - auto-refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Don't try to refresh on auth endpoints
        const isAuthEndpoint = originalRequest.url?.includes('/auth/');

        // If error is 401 and we haven't tried to refresh yet
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isAuthEndpoint
        ) {
          if (this.isRefreshing) {
            // Wait for the refresh to complete
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await this.client.post<AuthResponse>(
              '/auth/refresh',
              { refreshToken },
            );

            const { accessToken, refreshToken: newRefreshToken } =
              response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Retry all queued requests with new token
            this.refreshSubscribers.forEach((callback) =>
              callback(accessToken),
            );
            this.refreshSubscribers = [];

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/sign-in';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
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

  async googleSignIn(data: GoogleSignInData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      '/auth/google/sign-in',
      data,
    );
    return response.data;
  }

  async googleSignUpInitiate(
    data: GoogleSignUpInitiateData,
  ): Promise<GoogleProfile> {
    const response = await this.client.post<GoogleProfile>(
      '/auth/google/sign-up/initiate',
      data,
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

  async getMe(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.client.post('/auth/logout', { refreshToken });
  }
}

export const apiClient = new ApiClient();
