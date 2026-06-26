import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import envConfig from "../config/env";

class InternalAuthMiddleware {
  public static validate(req: Request, res: Response, next: NextFunction): void {
    const supplied = req.header("x-internal-service-token") || "";
    const expected = envConfig.internalServiceToken;
    const valid =
      supplied.length === expected.length &&
      timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
    if (!valid) {
      res.status(401).json({ message: "Unauthorized service request" });
      return;
    }
    next();
  }
}

export default InternalAuthMiddleware;
