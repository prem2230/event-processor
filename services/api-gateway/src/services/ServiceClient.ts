import envConfig from "../config/env";
import { ServiceResponse } from "../interfaces";
import Logger from "../utils/logger";

class ServiceClient {
  private static readonly envConfig = envConfig;
  private static readonly logger = Logger;

  public static async request<T>(
    baseUrl: string,
    path: string,
    options: RequestInit = {},
    userId?: string,
  ): Promise<ServiceResponse<T>> {
    const headers = new Headers(options.headers);
    headers.set("content-type", "application/json");
    headers.set(
      "x-internal-service-token",
      this.envConfig.internalServiceToken,
    );
    if (userId) headers.set("x-authenticated-user-id", userId);

    const startedAt = Date.now();
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
        signal: AbortSignal.timeout(this.envConfig.upstreamTimeoutMs),
      });
      const body = (await response.json()) as T;
      this.logger.info("Upstream request completed", {
        upstream: new URL(baseUrl).host,
        path,
        statusCode: response.status,
        durationMs: Date.now() - startedAt,
      });
      return { status: response.status, body };
    } catch (error) {
      this.logger.error("Upstream request failed", {
        upstream: new URL(baseUrl).host,
        path,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        status: 502,
        body: { message: "Upstream service unavailable" } as T,
      };
    }
  }
}

export default ServiceClient;
