import type { Request } from "express";
import type { AuthenticatedUser } from "../interfaces";

export interface AuthenticatedRequest extends Request {
  authenticatedUser?: AuthenticatedUser;
}
