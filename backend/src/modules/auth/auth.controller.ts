import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";

export class AuthController {
  public authenticateTelegram = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await authService.authenticateTelegramUser(req.body);
      res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  };

  public checkUserStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { telegramId } = req.params;
      const id = Array.isArray(telegramId) ? telegramId[0] : telegramId;
      const status = await authService.checkTelegramUserStatus(id as string);
      res.status(200).json({ status: "success", data: status });
    } catch (error) {
      next(error);
    }
  };

  public updatePhone = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await authService.updateUserPhone(req.body);
      res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  };

  public updateLanguage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await authService.updateUserLanguage(req.body);
      res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  };

  public updateProviderType = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await authService.updateUserProviderType(req.body);
      res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ status: "fail", message: "Unauthorized" });
      }
      const profile = await authService.getUserProfile(req.user.userId);
      res.status(200).json({ status: "success", data: { user: profile } });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
