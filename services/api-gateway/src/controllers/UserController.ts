import type { Response } from "express";
import UserServiceClient from "../services/UserServiceClient";
import type { AuthenticatedRequest } from "../types";

class UserController {
  public static async getProfile(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> {
    const result = await UserServiceClient.getProfile(
      req.authenticatedUser?.userId || "",
    );
    return res.status(result.status).json(result.body);
  }
}
export default UserController;
