import jwt from 'jsonwebtoken';
import { AuthToken, JwtPayload } from '../types/auth';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev-secret-change-in-prod';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-change-in-prod';
const ACCESS_TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(): string {
  return jwt.sign(
    { type: 'refresh' },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function generateAuthToken(userId: string, username: string): AuthToken {
  const token = generateAccessToken({
    userId,
    username,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    iat: Math.floor(Date.now() / 1000),
  });

  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return { token, refreshToken, expiresAt };
}
