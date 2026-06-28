/// <reference types="jest" />
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import AccountController from "../../src/controllers/AccountController";
import AccountService from "../../src/services/AccountService";

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

const request = (
  body: unknown = {},
  params: Record<string, string> = {},
): Request =>
  ({
    body,
    params,
    header: jest.fn((name: string) =>
      name === "x-authenticated-user-id" ? "user-1" : undefined,
    ),
  }) as unknown as Request;

describe("AccountController", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates an account for the authenticated user", async () => {
    const createdAt = new Date("2026-01-01");
    jest.spyOn(AccountService, "create").mockResolvedValue({
      accountId: "account-1",
      userId: "user-1",
      type: "CURRENT",
      currency: "INR",
      status: "ACTIVE",
      createdAt,
    });
    const res = response();

    await AccountController.create(request({ type: "CURRENT" }), res);

    expect(AccountService.create).toHaveBeenCalledWith("user-1", {
      type: "CURRENT",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: "account-1" }),
    );
  });

  it("returns create failures as bad requests", async () => {
    jest
      .spyOn(AccountService, "create")
      .mockRejectedValue(new Error("INVALID_ACCOUNT_TYPE"));
    const res = response();

    await AccountController.create(request({ type: "OTHER" }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "INVALID_ACCOUNT_TYPE" });
  });

  it("lists accounts for the authenticated user", async () => {
    jest.spyOn(AccountService, "list").mockResolvedValue([]);
    const res = response();

    await AccountController.list(request(), res);

    expect(AccountService.list).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("gets an account when it exists", async () => {
    const createdAt = new Date("2026-01-01");
    jest.spyOn(AccountService, "get").mockResolvedValue({
      accountId: "account-1",
      userId: "user-1",
      type: "SAVINGS",
      currency: "INR",
      status: "ACTIVE",
      createdAt,
    });
    const res = response();

    await AccountController.get(request({}, { accountId: "account-1" }), res);

    expect(AccountService.get).toHaveBeenCalledWith("account-1", "user-1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns not found for missing accounts", async () => {
    jest.spyOn(AccountService, "get").mockResolvedValue(null);
    const res = response();

    await AccountController.get(request({}, { accountId: "missing" }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Account not found" });
  });
});
