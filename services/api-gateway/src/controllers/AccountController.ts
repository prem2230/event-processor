import type { Response } from "express";
import AccountServiceClient from "../services/AccountServiceClient";
import type { AuthenticatedRequest } from "../types";

class AccountController {
  private readonly accountServiceClient = AccountServiceClient;

  public readonly create = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> => {
    const result = await this.accountServiceClient.create(
      req.authenticatedUser?.userId || "",
      req.body,
    );
    return res.status(result.status).json(result.body);
  };

  public readonly list = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> => {
    const result = await this.accountServiceClient.list(
      req.authenticatedUser?.userId || "",
    );
    return res.status(result.status).json(result.body);
  };

  public readonly get = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> => {
    const result = await this.accountServiceClient.get(
      req.authenticatedUser?.userId || "",
      String(req.params.accountId || ""),
    );
    return res.status(result.status).json(result.body);
  };
}
export default new AccountController();
