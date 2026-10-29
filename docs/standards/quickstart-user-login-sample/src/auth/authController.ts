import { Request, Response, NextFunction } from 'express';
import { authService } from './authService';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      const result = await authService.register({ username, password });

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      return res.status(201).json({
        success: true,
        user: {
          id: result.user!.id,
          username: result.user!.username,
          createdAt: result.user!.createdAt,
          updatedAt: result.user!.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      const result = await authService.login({ username, password });

      if (!result.success) {
        return res.status(401).json({ success: false, error: result.error });
      }

      return res.status(200).json({
        success: true,
        token: result.token,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      const result = await authService.logout(refreshToken || '');

      if (!result.success) {
        return res.status(500).json({ success: false, error: result.error });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
