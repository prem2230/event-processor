import type { Request, Response } from "express";
import type {
  CreateAccountRequest,
  BalanceMutationRequest,
} from "../interfaces";
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
  public readonly applyBalanceMutation = async (
    req: Request<{ accountId: string }, unknown, BalanceMutationRequest>,
    res: Response,
  ): Promise<Response> => {
    try {
      const userId = req.header("x-authenticated-user-id") || "";
      console.log({
        message: "Applying balance mutation",
        userId,
        accountId: req.params.accountId,
        requestBody: req.body,
      });
      return res.status(202).json(
        await this.accountService.applyBalanceMutation(userId, String(req.params.accountId || ""), req.body),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "BALANCE_MUTATION_FAILED";
      const status =
        message === "ACCOUNT_NOT_FOUND_OR_INSUFFICIENT_FUNDS" ? 409 : 400;
      return res.status(status).json({ message });
    }
  };
}

export default new AccountController();
