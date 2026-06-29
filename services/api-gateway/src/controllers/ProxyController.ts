import type { Request, Response } from "express";
import ServiceClient from "../services/ServiceClient";
import type { AuthenticatedRequest } from "../types";
import type { ProxyRouteConfig } from "../config/proxyRoutes";

class ProxyController {
  private static readonly serviceClient = ServiceClient;

  public static handler(route: ProxyRouteConfig) {
    return async (
      req: AuthenticatedRequest & Request,
      res: Response,
    ): Promise<Response> => {
      const upstreamPath =
        typeof route.upstreamPath === "function"
          ? route.upstreamPath(req)
          : route.upstreamPath;

      if (!upstreamPath) {
        return res.status(400).json({ message: "Invalid proxy request" });
      }

      const result = await this.serviceClient.request<unknown>(
        route.upstreamBaseUrl,
        upstreamPath,
        {
          method: req.method,
          body: ["GET", "HEAD"].includes(req.method)
            ? undefined
            : JSON.stringify(req.body),
          headers: {
            authorization: req.header("authorization") || "",
          },
        },
        req.authenticatedUser?.userId || "",
      );

      return res.status(result.status).json(result.body);
    };
  }
}

export default ProxyController;
