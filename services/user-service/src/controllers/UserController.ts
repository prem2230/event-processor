import type { Request, Response } from "express";
import type { RegisterUserRequest, VerifyCredentialsRequest } from "../interfaces";
import UserService from "../services/UserService";

class UserController {
  private static readonly userService = UserService;

  public static async register(
    req: Request<unknown, unknown, RegisterUserRequest>,
    res: Response,
  ): Promise<Response> {
    try {
      return res.status(201).json(await this.userService.register(req.body));
    } catch (error) {
      const code = error instanceof Error ? error.message : "REGISTRATION_FAILED";
      const status = code === "EMAIL_ALREADY_REGISTERED" ? 409 : 400;
      return res.status(status).json({ message: code });
    }
  }

  public static async verifyCredentials(
    req: Request<unknown, unknown, VerifyCredentialsRequest>,
    res: Response,
  ): Promise<Response> {
    const profile = await this.userService.verifyCredentials(req.body);
    return profile
      ? res.status(200).json(profile)
      : res.status(401).json({ message: "Invalid credentials" });
  }

  public static async getProfile(req: Request, res: Response): Promise<Response> {
    const userId = req.header("x-authenticated-user-id") || "";
    const profile = await this.userService.getProfile(userId);
    return profile
      ? res.status(200).json(profile)
      : res.status(404).json({ message: "User not found" });
  }
}

export default UserController;
