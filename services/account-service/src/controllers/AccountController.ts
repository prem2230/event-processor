import type { Request, Response } from "express";
import type { CreateAccountRequest } from "../interfaces";
import AccountService from "../services/AccountService";

class AccountController {
  private readonly accountService = AccountService;

  public readonly create = async (
    req: Request<unknown, unknown, CreateAccountRequest>,
    res: Response,
  ): Promise<Response> => {
    try {
      const userId = req.header("x-authenticated-user-id") || "";
      return res
        .status(201)
        .json(await this.accountService.create(userId, req.body));
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "ACCOUNT_CREATE_FAILED",
      });
    }
  };
  public readonly list = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return res
      .status(200)
      .json(
        await this.accountService.list(
          req.header("x-authenticated-user-id") || "",
        ),
      );
  };
  public get = async (req: Request, res: Response): Promise<Response> => {
    const account = await this.accountService.get(
      String(req.params.accountId || ""),
      req.header("x-authenticated-user-id") || "",
    );
    return account
      ? res.status(200).json(account)
      : res.status(404).json({ message: "Account not found" });
  };
}

export default new AccountController();
