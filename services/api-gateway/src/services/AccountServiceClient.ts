import envConfig from "../config/env";
import { Account } from "../interfaces";
import ServiceClient from "./ServiceClient";

class AccountServiceClient {
  private static readonly envConfig = envConfig;
  private static readonly serviceClient = ServiceClient;

  public static create(userId: string, data: unknown) {
    return this.serviceClient.request<Account | { message: string }>(
      this.envConfig.accountServiceUrl,
      "/internal/accounts",
      { method: "POST", body: JSON.stringify(data) },
      userId,
    );
  }

  public static list(userId: string) {
    return this.serviceClient.request<Account[]>(
      this.envConfig.accountServiceUrl,
      "/internal/accounts",
      { method: "GET" },
      userId,
    );
  }

  public static get(userId: string, accountId: string) {
    return this.serviceClient.request<Account | { message: string }>(
      this.envConfig.accountServiceUrl,
      `/internal/accounts/${encodeURIComponent(accountId)}`,
      { method: "GET" },
      userId,
    );
  }
}

export default AccountServiceClient;
