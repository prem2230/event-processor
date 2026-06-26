import type { Request, Response } from "express";
import type { LoginRequest, RegisterUserRequest } from "../interfaces";
import TokenService from "../services/TokenService";
import UserServiceClient, {
  type UserProfile,
} from "../services/UserServiceClient";
import Logger from "../utils/logger";
import envConfig from "../config/env";

class AuthController {
  public static async register(
    req: Request<unknown, unknown, RegisterUserRequest>,
    res: Response,
  ): Promise<Response> {
    const result = await UserServiceClient.register(req.body);
    return res.status(result.status).json(result.body);
  }

  public static async login(
    req: Request<unknown, unknown, LoginRequest>,
    res: Response,
  ): Promise<Response> {
    const result = await UserServiceClient.verifyCredentials(req.body);
    if (result.status !== 200) {
      Logger.warn("Login rejected");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.body as UserProfile;
    const accessToken = TokenService.issue({
      userId: user.userId,
      email: user.email,
    });
    Logger.info("Access token issued");
    return res.status(200).json({
      accessToken,
      tokenType: "Bearer",
      expiresIn: envConfig.jwtExpiresInSeconds,
      user,
    });
  }
}

export default AuthController;
