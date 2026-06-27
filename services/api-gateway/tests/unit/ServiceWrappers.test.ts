import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import AccountServiceClient from "../../src/services/AccountServiceClient";
import ServiceClient from "../../src/services/ServiceClient";
import UserServiceClient from "../../src/services/UserServiceClient";

jest.mock("../../src/services/ServiceClient", () => ({
  __esModule: true,
  default: {
    request: jest.fn(),
  },
}));

describe("service wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("routes user operations through ServiceClient", async () => {
    jest.mocked(ServiceClient.request).mockResolvedValue({
      status: 200,
      body: { ok: true },
    });

    await UserServiceClient.register({ email: "user@example.com" } as never);
    await UserServiceClient.verifyCredentials({
      email: "user@example.com",
      password: "secret",
    });
    await UserServiceClient.getProfile("user-101");

    expect(ServiceClient.request).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      "/internal/users",
      expect.objectContaining({ method: "POST" }),
    );
    expect(ServiceClient.request).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      "/internal/auth/verify",
      expect.objectContaining({ method: "POST" }),
    );
    expect(ServiceClient.request).toHaveBeenNthCalledWith(
      3,
      expect.any(String),
      "/internal/users/me",
      expect.objectContaining({ method: "GET" }),
      "user-101",
    );
  });

  it("routes account operations through ServiceClient", async () => {
    jest.mocked(ServiceClient.request).mockResolvedValue({
      status: 200,
      body: { ok: true },
    });

    await AccountServiceClient.create("user-101", { currency: "INR" });
    await AccountServiceClient.list("user-101");
    await AccountServiceClient.get("user-101", "acc/with space");

    expect(ServiceClient.request).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      "/internal/accounts",
      expect.objectContaining({ method: "POST" }),
      "user-101",
    );
    expect(ServiceClient.request).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      "/internal/accounts",
      expect.objectContaining({ method: "GET" }),
      "user-101",
    );
    expect(ServiceClient.request).toHaveBeenNthCalledWith(
      3,
      expect.any(String),
      "/internal/accounts/acc%2Fwith%20space",
      expect.objectContaining({ method: "GET" }),
      "user-101",
    );
  });
});
