import { User, LoginRequest, RegisterRequest } from '../types/auth';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { generateAuthToken } from '../utils/jwt';

// In-memory user store (replace with database in production)
const users: Map<string, User> = new Map();
let userIdCounter = 1;

export class AuthService {
  async register(request: RegisterRequest): Promise<{ success: boolean; user?: User; error?: string }> {
    // Validate username
    if (!request.username || request.username.trim().length < 3) {
      return { success: false, error: 'ユーザー名は 3 文字以上必要です' };
    }

    if (!request.password || request.password.length < 8) {
      return { success: false, error: 'パスワードは 8 文字以上必要です' };
    }

    // Check if user already exists
    if (users.has(request.username)) {
      return { success: false, error: 'このユーザー名は既に使用されています' };
    }

    // Hash password
    const passwordHash = await hashPassword(request.password);

    // Create user
    const user: User = {
      id: String(userIdCounter++),
      username: request.username.trim(),
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.set(user.id, user);

    return { success: true, user };
  }

  async login(request: LoginRequest): Promise<{ success: boolean; token?: string; refreshToken?: string; expiresAt?: Date; error?: string }> {
    const user = users.get(request.username);

    if (!user) {
      return { success: false, error: '無効なユーザー名' };
    }

    const isValidPassword = await verifyPassword(request.password, user.passwordHash);

    if (!isValidPassword) {
      return { success: false, error: '無効なパスワード' };
    }

    // Generate auth token
    const { token, refreshToken, expiresAt } = generateAuthToken(user.id, user.username);

    return { success: true, token, refreshToken, expiresAt };
  }

  async logout(refreshToken: string): Promise<{ success: boolean; error?: string }> {
    // In production, invalidate the refresh token in database
    // For now, we just return success
    return { success: true };
  }
}

export const authService = new AuthService();
