import type { Request, Response } from "express";
import HealthService from "../services/HealthService";
export default class HealthController { static liveness(_req: Request, res: Response): Response { return res.status(200).json({ service: "payment-service", status: "ok", uptimeSeconds: Math.floor(process.uptime()) }); } static readiness(_req: Request, res: Response): Response { const state = HealthService.getReadiness(); return res.status(state.ready ? 200 : 503).json({ service: "payment-service", status: state.ready ? "ready" : "not_ready", checks: state.checks }); } }
