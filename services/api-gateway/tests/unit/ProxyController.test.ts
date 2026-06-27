import type { Response } from "express";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import AccountController from "../../src/controllers/AccountController";
import UserController from "../../src/controllers/UserController";
import AccountServiceClient from "../../src/services/AccountServiceClient";
import UserServiceClient from "../../src/services/UserServiceClient";
import type { Account, UserProfile } from "../../src/interfaces";
import type { AuthenticatedRequest } from "../../src/types";

const userProfile: UserProfile = {
  userId: "user-101",
  email: "user@example.com",
  firstName: "Prem",
  lastName: "K",
  status: "ACTIVE",
};

const account: Account = {
  accountId: "acc-1",
  userId: "user-101",
  type: "SAVINGS",
  currency: "INR",
  status: "ACTIVE",
};

jest.mock("../../src/services/AccountServiceClient", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    list: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock("../../src/services/UserServiceClient", () => ({
  __esModule: true,
  default: {
    getProfile: jest.fn(),
  },
}));

function mockResponse(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

describe("Proxy controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets the authenticated user profile", async () => {
    jest.mocked(UserServiceClient.getProfile).mockResolvedValue({
      status: 200,
      body: userProfile,
    });
    const req = {
      authenticatedUser: { userId: "user-101", email: "user@example.com" },
    } as AuthenticatedRequest;
    const res = mockResponse();

    await UserController.getProfile(req, res);

    expect(UserServiceClient.getProfile).toHaveBeenCalledWith("user-101");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("creates an account for the authenticated user", async () => {
    jest.mocked(AccountServiceClient.create).mockResolvedValue({
      status: 201,
      body: account,
    });
    const req = {
      authenticatedUser: { userId: "user-101", email: "user@example.com" },
      body: { type: "SAVINGS", currency: "INR" },
    } as AuthenticatedRequest;
    const res = mockResponse();

    await AccountController.create(req, res);

    expect(AccountServiceClient.create).toHaveBeenCalledWith(
      "user-101",
      req.body,
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("lists accounts for the authenticated user", async () => {
    jest.mocked(AccountServiceClient.list).mockResolvedValue({
      status: 200,
      body: [account],
    });
    const req = {
      authenticatedUser: { userId: "user-101", email: "user@example.com" },
    } as AuthenticatedRequest;
    const res = mockResponse();

    await AccountController.list(req, res);

    expect(AccountServiceClient.list).toHaveBeenCalledWith("user-101");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("gets a single account for the authenticated user", async () => {
    jest.mocked(AccountServiceClient.get).mockResolvedValue({
      status: 200,
      body: account,
    });
    const req = {
      authenticatedUser: { userId: "user-101", email: "user@example.com" },
      params: { accountId: "acc-1" },
    } as unknown as AuthenticatedRequest;
    const res = mockResponse();

    await AccountController.get(req, res);

    expect(AccountServiceClient.get).toHaveBeenCalledWith("user-101", "acc-1");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
