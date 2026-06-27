import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import AuthController from "../../src/controllers/AuthController";
import TokenService from "../../src/services/TokenService";
import UserServiceClient from "../../src/services/UserServiceClient";

jest.mock("../../src/services/UserServiceClient", () => ({
  __esModule: true,
  default: {
    register: jest.fn(),
    verifyCredentials: jest.fn(),
  },
}));

jest.mock("../../src/services/TokenService", () => ({
  __esModule: true,
  default: {
    issueToken: jest.fn(),
  },
}));

function mockResponse(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

describe("AuthController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("forwards registration to the user service", async () => {
    jest.mocked(UserServiceClient.register).mockResolvedValue({
      status: 201,
      body: {
        userId: "user-101",
        email: "user@example.com",
        firstName: "Prem",
        lastName: "K",
        status: "ACTIVE",
      },
    });
    const req = {
      body: {
        email: "user@example.com",
        password: "strong-password",
      },
    } as Request;
    const res = mockResponse();

    await AuthController.register(req, res);

    expect(UserServiceClient.register).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("issues an access token when credentials are valid", async () => {
    const user = {
      userId: "user-101",
      email: "user@example.com",
      firstName: "Prem",
      lastName: "K",
      status: "ACTIVE",
    };
    jest.mocked(UserServiceClient.verifyCredentials).mockResolvedValue({
      status: 200,
      body: user,
    });
    jest.mocked(TokenService.issueToken).mockReturnValue("signed-token");
    const req = { body: { email: user.email, password: "secret" } } as Request;
    const res = mockResponse();

    await AuthController.login(req, res);

    expect(TokenService.issueToken).toHaveBeenCalledWith(user);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "signed-token",
        tokenType: "Bearer",
        user,
      }),
    );
  });

  it("returns 401 when credentials are rejected", async () => {
    jest.mocked(UserServiceClient.verifyCredentials).mockResolvedValue({
      status: 401,
      body: { message: "Invalid credentials" },
    });
    const req = {
      body: { email: "user@example.com", password: "wrong" },
    } as Request;
    const res = mockResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    expect(TokenService.issueToken).not.toHaveBeenCalled();
  });
});
