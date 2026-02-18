export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  emailVerified: boolean;
  isGoogleLinked: boolean;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
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

export interface GoogleSignUpCompleteData {
  name: string;
  username: string;
}

export interface GoogleProfile {
  name: string;
  email: string;
  googleId: string;
  avatarUrl?: string;
}

export interface ResendCooldownEmail {
  retryAfterSeconds: number;
}

export interface ResendCooldownPasswordReset {
  retryAfterSeconds: number;
}
