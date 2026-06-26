import type { Request, Response } from "express";
import type { CreateAccountRequest } from "../interfaces";
import AccountService from "../services/AccountService";

class AccountController {
  public static async create(
    req: Request<unknown, unknown, CreateAccountRequest>,
    res: Response,
  ): Promise<Response> {
    try {
      const userId = req.header("x-authenticated-user-id") || "";
      return res.status(201).json(await AccountService.create(userId, req.body));
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "ACCOUNT_CREATE_FAILED",
      });
    }
  }
  public static async list(req: Request, res: Response): Promise<Response> {
    return res
      .status(200)
      .json(await AccountService.list(req.header("x-authenticated-user-id") || ""));
  }
  public static async get(req: Request, res: Response): Promise<Response> {
    const account = await AccountService.get(
      String(req.params.accountId || ""),
      req.header("x-authenticated-user-id") || "",
    );
    return account
      ? res.status(200).json(account)
      : res.status(404).json({ message: "Account not found" });
  }
}

export default AccountController;
