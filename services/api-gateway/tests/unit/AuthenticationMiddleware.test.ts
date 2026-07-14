import type { Response } from "express";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import AuthenticationMiddleware from "../../src/middleware/AuthenticationMiddleware";
import TokenService from "../../src/services/TokenService";
import type { AuthenticatedRequest } from "../../src/types";

function mockResponse(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

describe("AuthenticationMiddleware", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("rejects requests without a bearer token", () => {
    const req = {
      header: jest.fn().mockReturnValue(""),
    } as unknown as AuthenticatedRequest;
    const res = mockResponse();
    const next = jest.fn();

    AuthenticationMiddleware.validate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Bearer token required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the authenticated user for a valid token", () => {
    jest.spyOn(TokenService, "verify").mockReturnValue({
      userId: "user-101",
      email: "user@example.com",
    });
    const req = {
      header: jest.fn().mockReturnValue("Bearer valid-token"),
    } as unknown as AuthenticatedRequest;
    const res = mockResponse();
    const next = jest.fn();

    AuthenticationMiddleware.validate(req, res, next);

    expect(req.authenticatedUser).toEqual({
      userId: "user-101",
      email: "user@example.com",
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid tokens", () => {
    jest.spyOn(TokenService, "verify").mockImplementation(() => {
      throw new Error("invalid token");
    });
    const req = {
      header: jest.fn().mockReturnValue("Bearer expired-token"),
      method: "GET",
      path: "/v1/api/users/me",
    } as unknown as AuthenticatedRequest;
    const res = mockResponse();
    const next = jest.fn();

    AuthenticationMiddleware.validate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
