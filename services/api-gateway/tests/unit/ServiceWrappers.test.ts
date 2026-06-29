import { beforeEach, describe, expect, it, jest } from "@jest/globals";
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
  });
});
