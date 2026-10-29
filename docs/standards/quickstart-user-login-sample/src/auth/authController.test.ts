import { authController } from './authController';
import { authService } from './authService';

jest.mock('./authService');

describe('AuthController', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      (authService.register as jest.Mock).mockResolvedValue({
        success: true,
        user: {
          id: '1',
          username: 'testuser',
          passwordHash: 'hashed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const req = {
        body: { username: 'testuser', password: 'password123' },
      } as any;

      await authController.register(req, mockRes, mockNext);

      expect(authService.register).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        user: {
          id: '1',
          username: 'testuser',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should return error for invalid username', async () => {
      (authService.register as jest.Mock).mockResolvedValue({
        success: false,
        error: 'ユーザー名は 3 文字以上必要です',
      });

      const req = {
        body: { username: 'ab', password: 'password123' },
      } as any;

      await authController.register(req, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'ユーザー名は 3 文字以上必要です',
      });
    });

    it('should return error for invalid password', async () => {
      (authService.register as jest.Mock).mockResolvedValue({
        success: false,
        error: 'パスワードは 8 文字以上必要です',
      });

      const req = {
        body: { username: 'testuser', password: 'short' },
      } as any;

      await authController.register(req, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'パスワードは 8 文字以上必要です',
      });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        success: true,
        token: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date(),
      });

      const req = {
        body: { username: 'testuser', password: 'password123' },
      } as any;

      await authController.login(req, mockRes, mockNext);

      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        token: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: expect.any(Date),
      });
    });

    it('should return error for invalid credentials', async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        success: false,
        error: '無効なユーザー名',
      });

      const req = {
        body: { username: 'nonexistent', password: 'password123' },
      } as any;

      await authController.login(req, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: '無効なユーザー名',
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      (authService.logout as jest.Mock).mockResolvedValue({
        success: true,
      });

      const req = {
        body: { refreshToken: 'refresh-token' },
      } as any;

      await authController.logout(req, mockRes, mockNext);

      expect(authService.logout).toHaveBeenCalledWith('refresh-token');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
