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
    publicPath: "/payments",
    upstreamBaseUrl: envConfig.paymentServiceUrl,
    upstreamPath: "/v1/api/payments",
  },
];

export default proxyRoutes;
