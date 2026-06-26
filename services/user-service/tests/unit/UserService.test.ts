import UserModel from "../../src/models/UserModel";
import PasswordService from "../../src/services/PasswordService";
import UserService from "../../src/services/UserService";

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
  beforeEach(() => jest.clearAllMocks());

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
});
