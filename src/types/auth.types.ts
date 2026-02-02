export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface GoogleSignInData {
  code: string;
}

export interface GoogleSignUpInitiateData {
  code: string;
}

export interface GoogleSignUpCompleteData {
  googleId: string;
  email: string;
  avatarUrl?: string;
  name: string;
  username: string;
}

export interface GoogleProfile {
  email: string;
  name?: string;
  googleId: string;
  avatarUrl?: string;
}
