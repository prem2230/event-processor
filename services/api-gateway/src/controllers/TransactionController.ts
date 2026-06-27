import type { Request, Response } from "express";
import type { CreateTransactionHttpRequest } from "../interfaces";
import type { AuthenticatedRequest } from "../types";
import AccountServiceClient from "../services/AccountServiceClient";
import TransactionInitiatorService from "../services/TransactionInitiatorService";
import Logger from "../utils/logger";

class TransactionController {
  private static readonly logger = Logger;
  private static transactionInitiatorService = TransactionInitiatorService;
  private static accountServiceClient = AccountServiceClient;

  public static async createTransaction(
    req: AuthenticatedRequest &
      Request<unknown, unknown, CreateTransactionHttpRequest>,
    res: Response,
  ): Promise<Response> {
    const startedAt = Date.now();

    try {
      const account = await this.accountServiceClient.get(
        req.authenticatedUser?.userId || "",
        req.body.accountId,
      );
      if (account.status !== 200) {
        return res.status(403).json({ message: "Account access denied" });
      }

      const data = {
        ...this.transactionInitiatorService.getCreateTransactionRequest(req),
        userId: req.authenticatedUser?.userId || "",
      };
      this.logger.info("Received create transaction request", {
        method: req.method,
        path: req.path,
      });
      const result =
        await this.transactionInitiatorService.initiateTransaction(
          data,
        );

      this.logger.info("Create transaction request completed", {
        method: req.method,
        path: req.path,
        statusCode: result.statusCode,
        durationMs: Date.now() - startedAt,
      });

      return res.status(result.statusCode).json(result.body);
    } catch (error) {
      this.logger.error("Create transaction request failed", {
        method: req.method,
        path: req.path,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });
      return this.transactionInitiatorService.handleCreateTransactionError(
        error,
        res,
      );
    }
  }
}

export default TransactionController;
