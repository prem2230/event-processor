import PasswordService from "../../src/services/PasswordService";
import { describe, expect, it, jest } from "@jest/globals";

describe("PasswordService", () => {
  it("hashes and verifies a password", async () => {
    const result = await PasswordService.hash("StrongPassword123!");
    expect(result.passwordHash).not.toContain("StrongPassword123!");
    expect(
      await PasswordService.verify(
        "StrongPassword123!",
        result.passwordHash,
        result.passwordSalt,
      ),
    ).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const result = await PasswordService.hash("StrongPassword123!");
    expect(
      await PasswordService.verify(
        "WrongPassword123!",
        result.passwordHash,
        result.passwordSalt,
      ),
    ).toBe(false);
  });
});
