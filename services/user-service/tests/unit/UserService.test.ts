import UserModel from "../../src/models/UserModel";
import PasswordService from "../../src/services/PasswordService";
import UserService from "../../src/services/UserService";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../src/models/UserModel", () => ({
  __esModule: true,
  default: {
    findByEmail: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock("../../src/services/PasswordService", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
    verify: jest.fn(),
  },
}));

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers a user without returning password fields", async () => {
    jest.mocked(UserModel.findByEmail).mockResolvedValue(null);
    jest.mocked(PasswordService.hash).mockResolvedValue({
      passwordHash: "hash",
      passwordSalt: "salt",
    });
    jest.mocked(UserModel.create).mockResolvedValue({
      userId: "user-1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      passwordHash: "hash",
      passwordSalt: "salt",
      status: "ACTIVE",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });

    const profile = await UserService.register({
      email: "user@example.com",
      password: "StrongPassword123!",
      firstName: "Test",
      lastName: "User",
    });

    expect(profile.userId).toBe("user-1");
    expect(profile).not.toHaveProperty("passwordHash");
    expect(profile).not.toHaveProperty("passwordSalt");
  });

  it("normalizes email and names before creating a user", async () => {
    jest.mocked(UserModel.findByEmail).mockResolvedValue(null);
    jest.mocked(PasswordService.hash).mockResolvedValue({
      passwordHash: "hash",
      passwordSalt: "salt",
    });
    jest.mocked(UserModel.create).mockImplementation(async (data) => ({
      ...data,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    }));

    await UserService.register({
      email: "USER@Example.COM",
      password: "StrongPassword123!",
      firstName: " Test ",
      lastName: " User ",
    });

    expect(UserModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        firstName: "Test",
        lastName: "User",
      }),
    );
  });

  it("rejects duplicate emails", async () => {
    jest.mocked(UserModel.findByEmail).mockResolvedValue({} as never);

    await expect(
      UserService.register({
        email: "user@example.com",
        password: "StrongPassword123!",
        firstName: "Test",
        lastName: "User",
      }),
    ).rejects.toThrow("EMAIL_ALREADY_REGISTERED");
  });

  it("rejects invalid registration input", async () => {
    await expect(
      UserService.register({
        email: "",
        password: "StrongPassword123!",
        firstName: "Test",
        lastName: "User",
      }),
    ).rejects.toThrow("INVALID_REGISTRATION");
    await expect(
      UserService.register({
        email: "not-an-email",
        password: "StrongPassword123!",
        firstName: "Test",
        lastName: "User",
      }),
    ).rejects.toThrow("INVALID_EMAIL");
    await expect(
      UserService.register({
        email: "user@example.com",
        password: "short",
        firstName: "Test",
        lastName: "User",
      }),
    ).rejects.toThrow("WEAK_PASSWORD");
  });

  it("verifies active user credentials", async () => {
    const createdAt = new Date("2026-01-01");
    jest.mocked(UserModel.findByEmail).mockResolvedValue({
      userId: "user-1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      passwordHash: "hash",
      passwordSalt: "salt",
      status: "ACTIVE",
      createdAt,
      updatedAt: createdAt,
    });
    jest.mocked(PasswordService.verify).mockResolvedValue(true);

    expect(
      await UserService.verifyCredentials({
        email: "user@example.com",
        password: "StrongPassword123!",
      }),
    ).toEqual({
      userId: "user-1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      status: "ACTIVE",
      createdAt,
    });
  });

  it("rejects missing, locked, and invalid credential checks", async () => {
    jest.mocked(UserModel.findByEmail).mockResolvedValueOnce(null);
    await expect(
      UserService.verifyCredentials({
        email: "missing@example.com",
        password: "StrongPassword123!",
      }),
    ).resolves.toBeNull();

    jest.mocked(UserModel.findByEmail).mockResolvedValueOnce({
      status: "LOCKED",
    } as never);
    await expect(
      UserService.verifyCredentials({
        email: "locked@example.com",
        password: "StrongPassword123!",
      }),
    ).resolves.toBeNull();

    jest.mocked(UserModel.findByEmail).mockResolvedValueOnce({
      userId: "user-1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      passwordHash: "hash",
      passwordSalt: "salt",
      status: "ACTIVE",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });
    jest.mocked(PasswordService.verify).mockResolvedValue(false);

    await expect(
      UserService.verifyCredentials({
        email: "user@example.com",
        password: "WrongPassword123!",
      }),
    ).resolves.toBeNull();
  });

  it("returns a profile by user id", async () => {
    const createdAt = new Date("2026-01-01");
    jest.mocked(UserModel.findByUserId).mockResolvedValue({
      userId: "user-1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      passwordHash: "hash",
      passwordSalt: "salt",
      status: "ACTIVE",
      createdAt,
      updatedAt: createdAt,
    });

    expect(await UserService.getProfile("user-1")).toEqual({
      userId: "user-1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      status: "ACTIVE",
      createdAt,
    });
  });

  it("returns null when a profile is missing", async () => {
    jest.mocked(UserModel.findByUserId).mockResolvedValue(null);

    await expect(UserService.getProfile("missing")).resolves.toBeNull();
  });
});
