import type { NextFunction, Request, Response } from "express";
import InternalAuthMiddleware from "../../src/middleware/InternalAuthMiddleware";
import { describe, expect, it, jest } from "@jest/globals";

const response = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

const request = (token?: string): Request =>
  ({
    header: jest.fn((name: string) =>
      name === "x-internal-service-token" ? token : undefined,
    ),
  }) as unknown as Request;

describe("InternalAuthMiddleware", () => {
  it("rejects missing and invalid service tokens", () => {
    const next = jest.fn() as NextFunction;
    const missing = response();
    const invalid = response();

    InternalAuthMiddleware.validate.call(
      InternalAuthMiddleware,
      request(),
      missing,
      next,
    );
    InternalAuthMiddleware.validate.call(
      InternalAuthMiddleware,
      request("wrong-token"),
      invalid,
      next,
    );

    expect(missing.status).toHaveBeenCalledWith(401);
    expect(invalid.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows valid service tokens", () => {
    const next = jest.fn() as NextFunction;
    const res = response();

    InternalAuthMiddleware.validate.call(
      InternalAuthMiddleware,
      request("local-internal-service-token"),
      res,
      next,
    );

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
