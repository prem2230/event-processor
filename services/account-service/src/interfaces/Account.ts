export type AccountType = "CURRENT" | "SAVINGS";
export type AccountStatus = "ACTIVE" | "FROZEN" | "CLOSED";

export interface CreateAccountRequest {
  type: AccountType;
  currency?: string;
}

export interface AccountResponse {
  accountId: string;
  userId: string;
  type: AccountType;
  currency: string;
  status: AccountStatus;
  createdAt: Date;
}
export interface AccountDocument {
  accountId: string;
  userId: string;
  type: AccountType;
  currency: string;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}
