import { CircleDollarSign, Radio } from "lucide-react";
import { formatCurrency } from "../utils";

interface AccountSummaryProps {
  accountId: string;
  balance: number;
}

export function AccountSummary({
  accountId,
  balance,
}: AccountSummaryProps) {
  return (
    <section className="account-card" id="accounts">
      <div className="account-topline">
        <div>
          <span className="section-kicker">Primary account</span>
          <strong>Pulse Current</strong>
        </div>
        <span className="account-chip">
          <Radio size={15} />
        </span>
      </div>
      <div className="balance-block">
        <span>Available balance</span>
        <strong>{formatCurrency(balance)}</strong>
      </div>
      <div className="account-meta">
        <span>
          <small>Account ID</small>
          <strong>{accountId}</strong>
        </span>
        <span>
          <small>Currency</small>
          <strong>INR</strong>
        </span>
        <CircleDollarSign size={34} />
      </div>
    </section>
  );
}
