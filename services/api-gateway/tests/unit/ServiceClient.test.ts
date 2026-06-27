import { afterEach, describe, expect, it, jest } from "@jest/globals";
import ServiceClient from "../../src/services/ServiceClient";

describe("ServiceClient", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("adds internal auth headers and returns the upstream response", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
      }),
    );

    const result = await ServiceClient.request<{ ok: boolean }>(
      "http://user-service:3001",
      "/internal/users/me",
      { method: "GET" },
      "user-101",
    );
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = requestInit.headers as Headers;

    expect(result).toEqual({ status: 200, body: { ok: true } });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://user-service:3001/internal/users/me",
      expect.objectContaining({ method: "GET" }),
    );
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("x-internal-service-token")).toBeTruthy();
    expect(headers.get("x-authenticated-user-id")).toBe("user-101");
  });

  it("returns a 502 response when the upstream request fails", async () => {
    jest
      .spyOn(global, "fetch")
      .mockRejectedValue(new Error("connection refused"));

    const result = await ServiceClient.request<{ message: string }>(
      "http://account-service:3002",
      "/internal/accounts",
    );

    expect(result).toEqual({
      status: 502,
      body: { message: "Upstream service unavailable" },
    });
  });
});
