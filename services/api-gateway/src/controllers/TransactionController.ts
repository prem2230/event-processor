import type { Request, Response } from "express";
import type { CreateTransactionRequest } from "../interfaces";
import TransactionInitiatorService from "../services/TransactionInitiatorService";
import Logger from "../utils/logger";

class TransactionController {
  private static readonly logger = Logger;
  private static transactionInitiatorService = TransactionInitiatorService;

  public static async createTransaction(
    req: Request<unknown, unknown, CreateTransactionRequest>,
    res: Response,
  ): Promise<Response> {
    const startedAt = Date.now();

    try {
      const data = TransactionInitiatorService.getCreateTransactionRequest(req);
      TransactionController.logger.info("Received create transaction request", {
        method: req.method,
        path: req.path,
      });
      const result =
        await TransactionController.transactionInitiatorService.initiateTransaction(
          data,
        );

      TransactionController.logger.info("Create transaction request completed", {
        method: req.method,
        path: req.path,
        statusCode: result.statusCode,
        durationMs: Date.now() - startedAt,
      });

      return res.status(result.statusCode).json(result.body);
    } catch (error) {
      TransactionController.logger.error("Create transaction request failed", {
        method: req.method,
        path: req.path,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });
      return TransactionInitiatorService.handleCreateTransactionError(
        error,
        res,
      );
    }
  }
}

export default TransactionController;
