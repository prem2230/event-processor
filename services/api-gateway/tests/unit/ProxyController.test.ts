import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import ProxyController from "../../src/controllers/ProxyController";
import ServiceClient from "../../src/services/ServiceClient";
import type { ProxyRouteConfig } from "../../src/config/proxyRoutes";
import type { AuthenticatedRequest } from "../../src/types";

jest.mock("../../src/services/ServiceClient", () => ({
  __esModule: true,
  default: {
    request: jest.fn(),
  },
}));

const route: ProxyRouteConfig = {
  method: "post",
  publicPath: "/accounts",
  upstreamBaseUrl: "http://account-service:3005",
  upstreamPath: "/internal/accounts",
};

function mockResponse(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

function mockRequest(
  body: unknown = { type: "SAVINGS" },
): AuthenticatedRequest & Request {
  return {
    method: "POST",
    body,
    authenticatedUser: { userId: "user-101", email: "user@example.com" },
    header: jest.fn((name: string) =>
      name.toLowerCase() === "authorization" ? "Bearer token" : undefined,
    ),
  } as unknown as AuthenticatedRequest & Request;
}

describe("ProxyController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(ServiceClient.request).mockResolvedValue({
      status: 201,
      body: { ok: true },
    });
  });

  it("forwards authenticated requests to the configured upstream", async () => {
    const req = mockRequest();
    const res = mockResponse();

    await ProxyController.handler(route)(req, res);

    expect(ServiceClient.request).toHaveBeenCalledWith(
      "http://account-service:3005",
      "/internal/accounts",
      {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: { authorization: "Bearer token" },
      },
      "user-101",
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("builds dynamic upstream paths", async () => {
    const req = mockRequest({ accountId: "acc 1", amount: 100 });
    const res = mockResponse();
    const dynamicRoute: ProxyRouteConfig = {
      method: "post",
      publicPath: "/transactions",
      upstreamBaseUrl: "http://account-service:3005",
      upstreamPath: (request) =>
        `/internal/accounts/${encodeURIComponent(
          String(request.body.accountId),
        )}/transactions`,
    };

    await ProxyController.handler(dynamicRoute)(req, res);

    expect(ServiceClient.request).toHaveBeenCalledWith(
      "http://account-service:3005",
      "/internal/accounts/acc%201/transactions",
      expect.any(Object),
      "user-101",
    );
  });

  it("returns bad request when a dynamic path cannot be built", async () => {
    const req = mockRequest({});
    const res = mockResponse();
    const invalidRoute: ProxyRouteConfig = {
      method: "post",
      publicPath: "/transactions",
      upstreamBaseUrl: "http://account-service:3005",
      upstreamPath: () => null,
    };

    await ProxyController.handler(invalidRoute)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(ServiceClient.request).not.toHaveBeenCalled();
  });
});
