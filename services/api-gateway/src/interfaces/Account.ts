export interface Account {
  accountId: string;
  userId: string;
  type: "CURRENT" | "SAVINGS";
  currency: string;
  status: string;
}
