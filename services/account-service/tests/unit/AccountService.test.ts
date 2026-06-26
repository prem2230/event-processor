import AccountModel from "../../src/models/AccountModel";
import AccountService from "../../src/services/AccountService";

jest.mock("../../src/models/AccountModel", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByUserId: jest.fn(),
    findOwnedAccount: jest.fn(),
  },
}));

describe("AccountService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates an account for the authenticated user", async () => {
    jest.mocked(AccountModel.create).mockImplementation(async (data) => ({
      ...data,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    }));

    const account = await AccountService.create("user-1", { type: "CURRENT" });

    expect(account.userId).toBe("user-1");
    expect(account.currency).toBe("INR");
    expect(account.status).toBe("ACTIVE");
  });

  it("fetches an account only through owner-scoped lookup", async () => {
    jest.mocked(AccountModel.findOwnedAccount).mockResolvedValue(null);

    expect(await AccountService.get("account-1", "user-2")).toBeNull();
    expect(AccountModel.findOwnedAccount).toHaveBeenCalledWith(
      "account-1",
      "user-2",
    );
  });
});
