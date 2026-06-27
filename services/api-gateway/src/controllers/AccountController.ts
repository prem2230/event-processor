import type { Response } from "express";
import AccountServiceClient from "../services/AccountServiceClient";
import type { AuthenticatedRequest } from "../types";

class AccountController {
  private static readonly accountServiceClient = AccountServiceClient;

  public static async create(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> {
    const result = await this.accountServiceClient.create(
      req.authenticatedUser?.userId || "",
      req.body,
    );
    return res.status(result.status).json(result.body);
  }
  public static async list(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> {
    const result = await this.accountServiceClient.list(
      req.authenticatedUser?.userId || "",
    );
    return res.status(result.status).json(result.body);
  }
  public static async get(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> {
    const result = await this.accountServiceClient.get(
      req.authenticatedUser?.userId || "",
      String(req.params.accountId || ""),
    );
    return res.status(result.status).json(result.body);
  }
}
export default AccountController;
