import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types";
import TokenService from "../services/TokenService";
import Logger from "../utils/logger";

class AuthenticationMiddleware {
  public static validate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void {
    const authorization = req.header("authorization") || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      res.status(401).json({ message: "Bearer token required" });
      return;
    }

    try {
      req.authenticatedUser = TokenService.verify(token);
      next();
    } catch {
      Logger.warn("JWT validation failed", {
        method: req.method,
        path: req.path,
      });
      res.status(401).json({ message: "Invalid or expired token" });
    }
  }
}

export default AuthenticationMiddleware;
