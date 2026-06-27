import type { Request, Response } from "express";
import type {
  LoginRequest,
  RegisterUserRequest,
  UserProfile,
} from "../interfaces";
import TokenService from "../services/TokenService";
import UserServiceClient from "../services/UserServiceClient";
import Logger from "../utils/logger";
import envConfig from "../config/env";

class AuthController {
  private readonly logger = Logger;
  private readonly tokenService = TokenService;
  private readonly userServiceClient = UserServiceClient;
  private readonly jwtExpiresInSeconds = envConfig.jwtExpiresInSeconds;

  public readonly register = async (
    req: Request<unknown, unknown, RegisterUserRequest>,
    res: Response,
  ): Promise<Response> => {
    const result = await this.userServiceClient.register(req.body);
    return res.status(result.status).json(result.body);
  };

  public readonly login = async (
    req: Request<unknown, unknown, LoginRequest>,
    res: Response,
  ): Promise<Response> => {
    const result = await this.userServiceClient.verifyCredentials(req.body);
    if (result.status !== 200) {
      this.logger.warn("Login rejected");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.body as UserProfile;
    const accessToken = this.tokenService.issueToken(user);
    return res.status(200).json({
      accessToken,
      tokenType: "Bearer",
      expiresIn: this.jwtExpiresInSeconds,
      user,
    });
  };
}

export default new AuthController();
