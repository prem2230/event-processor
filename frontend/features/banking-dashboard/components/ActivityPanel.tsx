import {
  Activity,
  ArrowDownLeft,
  Clock3,
  Plug,
  ServerCrash,
  X,
} from "lucide-react";
import { notificationUrl } from "../config";
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
  userId: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ActivityPanel({
  connectionStatus,
  error,
  notifications,
  onConnect,
  onDisconnect,
  pendingEvents,
  userId,
}: ActivityPanelProps) {
  const isEmpty = notifications.length === 0 && pendingEvents.length === 0;

  return (
    <section className="activity-panel" id="transactions">
      <div className="section-heading activity-heading">
        <div>
          <span className="section-kicker">Real-time ledger</span>
          <h2>Live activity</h2>
        </div>
        <div className="stream-actions">
          {connectionStatus === "connected" ? (
            <button
              className="secondary-action"
              type="button"
              onClick={onDisconnect}
            >
              <X size={16} />
              Close
            </button>
          ) : (
            <button
              className="secondary-action connect-action"
              type="button"
              onClick={onConnect}
              disabled={connectionStatus === "connecting"}
            >
              <Plug size={16} />
              {connectionStatus === "connecting" ? "Connecting" : "Connect"}
            </button>
          )}
        </div>
      </div>

      <div className="stream-address">
        <span className={`stream-indicator status-${connectionStatus}`} />
        <span>{notificationUrl}/v1/api/events/{userId}</span>
      </div>

      {error ? (
        <div className="error-row" role="alert">
          <ServerCrash size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="event-list">
        {isEmpty ? (
          <EmptyState onConnect={onConnect} />
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

  return (
    <article className="event-row">
      <span className={`transaction-icon ${isFailed ? "failed" : ""}`}>
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
        <span
          className={`event-status ${notification.data.status.toLowerCase()}`}
        >
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

function EmptyState({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Activity size={23} />
      </span>
      <strong>No transaction activity</strong>
      <span>Connect the live stream to receive processed events.</span>
      <button type="button" onClick={onConnect}>
        <Plug size={16} />
        Connect stream
      </button>
    </div>
  );
}
