import {
  Activity,
  ArrowDownLeft,
  Clock3,
  ServerCrash,
  X,
} from "lucide-react";
import type {
  ConnectionStatus,
  NotificationEvent,
  TransactionResponse,
} from "../types";
import { formatCurrency, formatEventTime } from "../utils";

interface ActivityPanelProps {
  connectionStatus: ConnectionStatus;
  error: string | null;
  notifications: NotificationEvent[];
  pendingEvents: TransactionResponse[];
}

export function ActivityPanel({
  connectionStatus,
  error,
  notifications,
  pendingEvents,
}: ActivityPanelProps) {
  const isEmpty = notifications.length === 0 && pendingEvents.length === 0;

  return (
    <section className="activity-panel" id="transactions">
      <div className="section-heading activity-heading">
        <div>
          <span className="section-kicker">Real-time ledger</span>
          <h2>Live activity</h2>
        </div>
        <span className={`connection-pill status-${connectionStatus}`}>Live updates</span>
      </div>

      <div className="stream-address" aria-label="Live update status">
        <span className={`stream-indicator status-${connectionStatus}`} />
        <span>Balance and payment updates are connected securely.</span>
      </div>

      {error ? (
        <div className="error-row" role="alert">
          <ServerCrash size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="event-list">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.eventId}
                notification={notification}
              />
            ))}
            {pendingEvents.map((transaction) => (
              <PendingTransactionRow
                key={transaction.event.eventId}
                transaction={transaction}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

function NotificationRow({
  notification,
}: {
  notification: NotificationEvent;
}) {
  const isFailed = notification.data.status === "FAILED";
  const isPending = ["INITIATED", "PENDING"].includes(notification.data.status);

  return (
    <article className="event-row">
      <span className={`transaction-icon ${isFailed ? "failed" : isPending ? "pending" : ""}`}>
        {isFailed ? <X size={18} /> : <ArrowDownLeft size={18} />}
      </span>
      <div className="event-copy">
        <strong>{notification.data.message}</strong>
        <span>
          {notification.data.transactionId} ·{" "}
          {formatEventTime(notification.occurredAt)}
        </span>
      </div>
      <div className="event-value">
        <strong>{formatCurrency(notification.data.updatedBalance)}</strong>
        <span className={`event-status ${isPending ? "pending" : notification.data.status.toLowerCase()}`}>
          {notification.data.status}
        </span>
      </div>
    </article>
  );
}

function PendingTransactionRow({
  transaction,
}: {
  transaction: TransactionResponse;
}) {
  const { amount, transactionId, type } = transaction.event.data;

  return (
    <article className="event-row pending-row">
      <span className="transaction-icon pending">
        <Clock3 size={18} />
      </span>
      <div className="event-copy">
        <strong>
          {type === "CREDIT" ? "Incoming credit" : "Outgoing debit"}
        </strong>
        <span>{transactionId} · just now</span>
      </div>
      <div className="event-value">
        <strong>
          {type === "DEBIT" ? "-" : "+"}
          {formatCurrency(amount)}
        </strong>
        <span className="event-status pending">PENDING</span>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Activity size={23} />
      </span>
      <strong>No transaction activity</strong>
      <span>Your payment updates will appear here automatically.</span>
    </div>
  );
}
