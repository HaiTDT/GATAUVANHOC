import type { Request, Response } from "express";
import { AuthError, authService } from "../services/auth.service";

const handleAuthError = (error: unknown, res: Response) => {
  if (error instanceof AuthError) {
    return res.status(error.statusCode).json({
      message: error.message
    });
  }

  return res.status(500).json({
    message: "Internal server error"
  });
};

const validateCredentials = (email?: unknown, password?: unknown) => {
  if (typeof email !== "string" || typeof password !== "string") {
    throw new AuthError("Email and password are required", 400);
  }

  if (!email.trim() || !password) {
    throw new AuthError("Email and password are required", 400);
  }
};

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, fullName, phone } = req.body;

      validateCredentials(email, password);

      const result = await authService.register({
        email,
        password,
        fullName,
        phone
      });

      return res.status(201).json(result);
    } catch (error) {
      return handleAuthError(error, res);
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      validateCredentials(email, password);

      const result = await authService.login({
        email,
        password
      });

      return res.json(result);
    } catch (error) {
      return handleAuthError(error, res);
    }
  },

  async registerWithGoogle(req: Request, res: Response) {
    try {
      const { googleToken } = req.body;

      if (typeof googleToken !== "string" || !googleToken.trim()) {
        throw new AuthError("Google token is required", 400);
      }

      const result = await authService.registerWithGoogle({
        googleToken
      });

      return res.status(201).json(result);
    } catch (error) {
      return handleAuthError(error, res);
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) throw new AuthError("Email is required", 400);
      const token = await authService.forgotPassword(email);
      // In simulation, we return the token to let the user "see" what would be in the email
      return res.json({ message: "Reset token generated", token });
    } catch (error) {
      return handleAuthError(error, res);
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) throw new AuthError("Token and new password are required", 400);
      await authService.resetPassword(token, newPassword);
      return res.json({ message: "Mật khẩu đã được đặt lại thành công" });
    } catch (error) {
      return handleAuthError(error, res);
    }
  }
};
