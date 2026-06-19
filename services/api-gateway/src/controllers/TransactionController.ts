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
    try {
      const data = TransactionInitiatorService.getCreateTransactionRequest(req);
      TransactionController.logger.info("Received create transaction request", {
        userId: data.userId,
        accountId: data.accountId,
      });
      const result =
        await TransactionController.transactionInitiatorService.initiateTransaction(
          data,
        );
      return res.status(result.statusCode).json(result.body);
    } catch (error) {
      return TransactionInitiatorService.handleCreateTransactionError(
        error,
        res,
      );
    }
  }
}

export default TransactionController;
