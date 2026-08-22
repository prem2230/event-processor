import { randomUUID } from "node:crypto";
import { Kafka } from "kafkajs";
import { config } from "../config";
import { PaymentModel, type PaymentDocument, type PaymentStatus } from "../models/PaymentModel";
import Logger from "../utils/logger";

export interface CreatePaymentRequest { sourceAccountId: string; destinationAccountId?: string; amount: number; currency?: string; }
const producer = new Kafka({ clientId: "payment-service", brokers: [config.kafkaBroker] }).producer();
let connected = false;

export class PaymentService {
  static async create(userId: string, idempotencyKey: string, request: CreatePaymentRequest): Promise<PaymentDocument> {
    if (!idempotencyKey || !request.sourceAccountId || !Number.isFinite(request.amount) || request.amount <= 0) throw new Error("INVALID_PAYMENT_REQUEST");
    const existing = await PaymentModel.findByIdempotencyKey(idempotencyKey);
    if (existing) return existing;
    const payment = await PaymentModel.create({ paymentId: randomUUID(), idempotencyKey, userId, sourceAccountId: request.sourceAccountId, destinationAccountId: request.destinationAccountId, amount: request.amount, currency: (request.currency || "INR").toUpperCase(), status: "INITIATED" });
    Logger.info("Payment initiated", { paymentId: payment.paymentId, userId, sourceAccountId: payment.sourceAccountId });
    await this.publish(payment, "INITIATED");
    try {
      const response = await fetch(`${config.accountServiceUrl}/internal/accounts/${encodeURIComponent(payment.sourceAccountId)}/balance-mutations`, { method: "POST", headers: { "content-type": "application/json", "x-internal-service-token": config.internalToken, "x-authenticated-user-id": userId }, body: JSON.stringify({ paymentId: payment.paymentId, type: "DEBIT", amount: payment.amount }) });
      if (!response.ok) throw new Error(response.status === 409 ? "INSUFFICIENT_AVAILABLE_BALANCE" : "ACCOUNT_MUTATION_REJECTED");
      const completed = await PaymentModel.complete(payment.paymentId);
      if (!completed) throw new Error("PAYMENT_STATE_CONFLICT");
      await this.publish(completed, "COMPLETED");
      Logger.info("Payment completed", { paymentId: completed.paymentId });
      return completed;
    } catch (error) {
      const failed = await PaymentModel.fail(payment.paymentId, error instanceof Error ? error.message : "PAYMENT_FAILED");
      if (!failed) throw error;
      await this.publish(failed, "FAILED");
      Logger.warn("Payment failed", { paymentId: failed.paymentId, reason: failed.failureReason || "PAYMENT_FAILED" });
      return failed;
    }
  }
  private static async publish(payment: PaymentDocument, status: PaymentStatus): Promise<void> {
    if (!connected) { await producer.connect(); connected = true; }
    await producer.send({ topic: config.notificationTopic, messages: [{ key: payment.userId, value: JSON.stringify({ eventId: randomUUID(), eventType: "notification.created", occurredAt: new Date().toISOString(), data: { userId: payment.userId, transactionId: payment.paymentId, accountId: payment.sourceAccountId, status, message: status === "INITIATED" ? "Transfer initiated" : status === "COMPLETED" ? "Transfer completed" : "Transfer failed", updatedBalance: 0 } }) }] });
  }
}
