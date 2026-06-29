import type { Request, Response } from "express";
import UserController from "../../src/controllers/UserController";
import UserService from "../../src/services/UserService";

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

const request = (body: unknown = {}, userId = "user-1"): Request =>
  ({
    body,
    header: jest.fn((name: string) =>
      name === "x-authenticated-user-id" ? userId : undefined,
    ),
  }) as unknown as Request;

describe("UserController", () => {
  afterEach(() => jest.restoreAllMocks());

  it("registers a user", async () => {
    const createdAt = new Date("2026-01-01");
    jest.spyOn(UserService, "register").mockResolvedValue({
      userId: "user-1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      status: "ACTIVE",
      createdAt,
    });
    const res = response();

    await UserController.register.call(
      UserController,
      request({ email: "user@example.com" }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1" }),
    );
  });

  it("maps duplicate registration to conflict", async () => {
    jest
      .spyOn(UserService, "register")
      .mockRejectedValue(new Error("EMAIL_ALREADY_REGISTERED"));
    const res = response();

    await UserController.register.call(UserController, request(), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "EMAIL_ALREADY_REGISTERED",
    });
  });

  it("maps other registration failures to bad requests", async () => {
    jest.spyOn(UserService, "register").mockRejectedValue("boom");
    const res = response();

    await UserController.register.call(UserController, request(), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "REGISTRATION_FAILED" });
  });

  it("verifies credentials", async () => {
    const createdAt = new Date("2026-01-01");
    jest.spyOn(UserService, "verifyCredentials").mockResolvedValue({
      userId: "user-1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      status: "ACTIVE",
      createdAt,
    });
    const res = response();

    await UserController.verifyCredentials.call(
      UserController,
      request({ email: "user@example.com" }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("rejects invalid credentials", async () => {
    jest.spyOn(UserService, "verifyCredentials").mockResolvedValue(null);
    const res = response();

    await UserController.verifyCredentials.call(UserController, request(), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  it("returns and misses profiles", async () => {
    const createdAt = new Date("2026-01-01");
    jest
      .spyOn(UserService, "getProfile")
      .mockResolvedValueOnce({
        userId: "user-1",
        email: "user@example.com",
        firstName: "Test",
        lastName: "User",
        status: "ACTIVE",
        createdAt,
      })
      .mockResolvedValueOnce(null);
    const found = response();
    const missing = response();

    await UserController.getProfile.call(UserController, request(), found);
    await UserController.getProfile.call(UserController, request(), missing);

    expect(found.status).toHaveBeenCalledWith(200);
    expect(missing.status).toHaveBeenCalledWith(404);
    expect(missing.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});
