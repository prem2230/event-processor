import express from "express";
import cors from "cors";
import NotificationRoutes from "./routes/NotificationRoute";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/v1/api", NotificationRoutes);

export default app;