import express from "express";
import { PaymentService, type CreatePaymentRequest } from "./services/PaymentService";
import HealthRoutes from "./routes/HealthRoute";
import Logger from "./utils/logger";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(HealthRoutes);
app.post("/v1/api/payments", async (req, res) => {
  const userId = req.header("x-authenticated-user-id") || "";
  const idempotencyKey = req.header("idempotency-key") || "";
  if (!userId) return res.status(401).json({ message: "UNAUTHENTICATED" });
  try {
    const payment = await PaymentService.create(userId, idempotencyKey, req.body as CreatePaymentRequest);
    Logger.info("Payment request completed", { paymentId: payment.paymentId, status: payment.status });
    return res.status(payment.status === "INITIATED" ? 202 : 201).json(payment);
  } catch (error) {
    const message = error instanceof Error ? error.message : "PAYMENT_CREATE_FAILED";
    Logger.error("Payment request failed", { message });
    return res.status(message === "INVALID_PAYMENT_REQUEST" ? 400 : 500).json({ message });
  }
});
export default app;
