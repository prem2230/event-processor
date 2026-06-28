import app, { NotificationServiceApp } from "../../src/app";

describe("NotificationServiceApp", () => {
  it("builds the Express app with routes and middleware", () => {
    const instance = new NotificationServiceApp();

    expect(instance.getApp()).toBeDefined();
    expect(app.get("x-powered-by")).toBe(false);
  });
});
