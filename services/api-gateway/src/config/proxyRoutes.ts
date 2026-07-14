import type { Request } from "express";
import envConfig from "./env";
import type { AuthenticatedRequest } from "../types";

type ProxyPathBuilder = (req: AuthenticatedRequest & Request) => string | null;

export interface ProxyRouteConfig {
  method: "get" | "post" | "put" | "patch" | "delete";
  publicPath: string;
  upstreamBaseUrl: string;
  upstreamPath: string | ProxyPathBuilder;
}

const proxyRoutes: ProxyRouteConfig[] = [
  {
    method: "get",
    publicPath: "/users/me",
    upstreamBaseUrl: envConfig.userServiceUrl,
    upstreamPath: "/internal/users/me",
  },
  {
    method: "post",
    publicPath: "/accounts",
    upstreamBaseUrl: envConfig.accountServiceUrl,
    upstreamPath: "/internal/accounts",
  },
  {
    method: "get",
    publicPath: "/accounts",
    upstreamBaseUrl: envConfig.accountServiceUrl,
    upstreamPath: "/internal/accounts",
  },
  {
    method: "get",
    publicPath: "/accounts/:accountId",
    upstreamBaseUrl: envConfig.accountServiceUrl,
    upstreamPath: (req) =>
      `/internal/accounts/${encodeURIComponent(String(req.params.accountId))}`,
  },
  {
    method: "post",
    publicPath: "/transactions",
    upstreamBaseUrl: envConfig.accountServiceUrl,
    upstreamPath: (req) => {
      const accountId =
        typeof req.body === "object" &&
        req.body !== null &&
        "accountId" in req.body
          ? String(req.body.accountId)
          : "";

      return accountId
        ? `/internal/accounts/${encodeURIComponent(accountId)}/transactions`
        : null;
    },
  },
];

export default proxyRoutes;
