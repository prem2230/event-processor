import express from "express";
import cors from "cors";
import TransactionRoutes from "./routes/TransactionRoute";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/v1/api", TransactionRoutes);

export default app;
