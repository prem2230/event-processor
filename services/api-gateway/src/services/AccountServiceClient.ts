import envConfig from "../config/env";
import ServiceClient from "./ServiceClient";

export interface Account {
  accountId: string;
  userId: string;
  type: "CURRENT" | "SAVINGS";
  currency: string;
  status: string;
}

class AccountServiceClient {
  public static create(userId: string, data: unknown) {
    return ServiceClient.request<Account | { message: string }>(
      envConfig.accountServiceUrl,
      "/internal/accounts",
      { method: "POST", body: JSON.stringify(data) },
      userId,
    );
  }

  public static list(userId: string) {
    return ServiceClient.request<Account[]>(
      envConfig.accountServiceUrl,
      "/internal/accounts",
      { method: "GET" },
      userId,
    );
  }

  public static get(userId: string, accountId: string) {
    return ServiceClient.request<Account | { message: string }>(
      envConfig.accountServiceUrl,
      `/internal/accounts/${encodeURIComponent(accountId)}`,
      { method: "GET" },
      userId,
    );
  }
}

export default AccountServiceClient;
