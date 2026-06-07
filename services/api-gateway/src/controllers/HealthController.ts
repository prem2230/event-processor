import Logger from "../utils/logger";
import type { Request, Response } from "express";

class HealthController {
    private static readonly logger = Logger;

    public static healthCheck(_req: Request, res: Response): Response {
        HealthController.logger.info("Health check requested");
        return res.status(200).json({
            service: "api-gateway",
            status: "ok",
        });
    }
}

export default HealthController;
