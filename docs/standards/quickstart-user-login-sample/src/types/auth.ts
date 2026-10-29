export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface AuthToken {
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface JwtPayload {
  userId: string;
  username: string;
  exp: number;
  iat: number;
}
