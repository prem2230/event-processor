import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Send,
  UserRound,
  WalletCards,
} from "lucide-react";
import type { FormEvent } from "react";
import type { TransactionType } from "../types";

interface TransactionFormProps {
  accountId: string;
  amount: string;
  isSubmitting: boolean;
  type: TransactionType;
  userId: string;
  onAccountIdChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  onTypeChange: (value: TransactionType) => void;
  onUserIdChange: (value: string) => void;
}

export function TransactionForm({
  accountId,
  amount,
  isSubmitting,
  onAccountIdChange,
  onAmountChange,
  onSubmit,
  onTypeChange,
  onUserIdChange,
  type,
  userId,
}: TransactionFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit();
  };

  return (
    <form className="transfer-panel" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <span className="section-kicker">New transaction</span>
          <h2>Move funds</h2>
        </div>
        <span className="heading-icon">
          <Send size={19} />
        </span>
      </div>

      <div className="segmented" role="group" aria-label="Transaction type">
        <button
          className={type === "CREDIT" ? "active" : ""}
          type="button"
          onClick={() => onTypeChange("CREDIT")}
        >
          <ArrowDownLeft size={17} />
          Credit
        </button>
        <button
          className={type === "DEBIT" ? "active" : ""}
          type="button"
          onClick={() => onTypeChange("DEBIT")}
        >
          <ArrowUpRight size={17} />
          Debit
        </button>
      </div>

      <label>
        User ID
        <span className="input-wrap">
          <UserRound size={17} />
          <input
            value={userId}
            onChange={(event) => onUserIdChange(event.target.value)}
          />
        </span>
      </label>

      <label>
        Account ID
        <span className="input-wrap">
          <WalletCards size={17} />
          <input
            value={accountId}
            onChange={(event) => onAccountIdChange(event.target.value)}
          />
        </span>
      </label>

      <label>
        Amount
        <span className="amount-input">
          <span>₹</span>
          <input
            min="1"
            type="number"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
          />
          <small>INR</small>
        </span>
      </label>

      <button className="primary-action" disabled={isSubmitting}>
        <span>{isSubmitting ? "Publishing" : "Publish Event"}</span>
        {isSubmitting ? (
          <RefreshCw className="spin" size={18} />
        ) : (
          <ArrowRight size={18} />
        )}
      </button>
    </form>
  );
}
