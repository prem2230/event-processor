import TokenService from "../../src/services/TokenService";

describe("TokenService", () => {
  it("issues and verifies an authenticated user token", () => {
    const token = TokenService.issue({
      userId: "user-1",
      email: "user@example.com",
    });

    expect(TokenService.verify(token)).toEqual({
      userId: "user-1",
      email: "user@example.com",
    });
  });

  it("rejects a modified token", () => {
    const token = TokenService.issue({
      userId: "user-1",
      email: "user@example.com",
    });

    expect(() => TokenService.verify(`${token}modified`)).toThrow();
  });
});
