"use client";

import {
  Activity,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  Plug,
  Radio,
  Send,
  ServerCrash,
  WalletCards,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type TransactionType = "CREDIT" | "DEBIT";
type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

interface NotificationEvent {
  eventId: string;
  eventType: "notification.created";
  occurredAt: string;
  data: {
    userId: string;
    transactionId: string;
    accountId: string;
    status: "COMPLETED" | "FAILED";
    message: string;
    updatedBalance: number;
  };
}

interface TransactionResponse {
  event: {
    eventId: string;
    occurredAt: string;
    data: {
      transactionId: string;
      userId: string;
      accountId: string;
      type: TransactionType;
      amount: number;
      status: "PENDING";
    };
  };
}

const apiGatewayUrl =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3000";
const notificationUrl =
  process.env.NEXT_PUBLIC_NOTIFICATION_URL || "http://localhost:3002";

export default function Home() {
  const [userId, setUserId] = useState("user-101");
  const [accountId, setAccountId] = useState("acc-5001");
  const [type, setType] = useState<TransactionType>("CREDIT");
  const [amount, setAmount] = useState("2500");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [pendingEvents, setPendingEvents] = useState<TransactionResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const latestBalance = useMemo(() => {
    return notifications[0]?.data.updatedBalance ?? 0;
  }, [notifications]);

  const connectSse = () => {
    eventSourceRef.current?.close();
    setConnectionStatus("connecting");
    setLastError(null);

    const source = new EventSource(
      `${notificationUrl}/v1/api/events/${encodeURIComponent(userId)}`
    );

    source.addEventListener("connected", () => {
      setConnectionStatus("connected");
    });

    source.addEventListener("notification", (event) => {
      const parsedEvent = JSON.parse(event.data) as NotificationEvent;
      setNotifications((current) => [parsedEvent, ...current].slice(0, 20));
      setPendingEvents((current) =>
        current.filter(
          (item) =>
            item.event.data.transactionId !== parsedEvent.data.transactionId
        )
      );
    });

    source.onerror = () => {
      setConnectionStatus("error");
      setLastError("SSE connection lost. Reconnect after checking the service.");
      source.close();
    };

    eventSourceRef.current = source;
  };

  const disconnectSse = () => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setConnectionStatus("idle");
  };

  const createTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLastError(null);

    try {
      const response = await fetch(`${apiGatewayUrl}/v1/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          accountId,
          type,
          amount: Number(amount),
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as TransactionResponse;
      setPendingEvents((current) => [payload, ...current].slice(0, 10));
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => eventSourceRef.current?.close();
  }, []);

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Real-Time Event Processing Platform</p>
          <h1>Banking Event Console</h1>
        </div>
        <div className={`status status-${connectionStatus}`}>
          <Radio size={18} />
          <span>{connectionStatus}</span>
        </div>
      </section>

      <section className="metrics-grid">
        <Metric
          icon={<WalletCards size={20} />}
          label="Latest Balance"
          value={`₹${latestBalance.toLocaleString("en-IN")}`}
        />
        <Metric
          icon={<Activity size={20} />}
          label="Pending Events"
          value={String(pendingEvents.length)}
        />
        <Metric
          icon={<Bell size={20} />}
          label="Notifications"
          value={String(notifications.length)}
        />
      </section>

      <section className="workspace">
        <form className="panel transaction-panel" onSubmit={createTransaction}>
          <div className="panel-heading">
            <CircleDollarSign size={22} />
            <h2>Create Transaction</h2>
          </div>

          <label>
            User ID
            <input value={userId} onChange={(e) => setUserId(e.target.value)} />
          </label>

          <label>
            Account ID
            <input
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            />
          </label>

          <div className="segmented" role="group" aria-label="Transaction type">
            <button
              className={type === "CREDIT" ? "active" : ""}
              type="button"
              onClick={() => setType("CREDIT")}
            >
              Credit
            </button>
            <button
              className={type === "DEBIT" ? "active" : ""}
              type="button"
              onClick={() => setType("DEBIT")}
            >
              Debit
            </button>
          </div>

          <label>
            Amount
            <input
              min="1"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <button className="primary-action" disabled={isSubmitting}>
            <Send size={18} />
            <span>{isSubmitting ? "Publishing" : "Publish Event"}</span>
          </button>
        </form>

        <section className="panel stream-panel">
          <div className="panel-heading spread">
            <div>
              <div className="inline-title">
                <Plug size={22} />
                <h2>SSE Stream</h2>
              </div>
              <p>{notificationUrl}/v1/api/events/{userId}</p>
            </div>
            <div className="actions">
              <button type="button" onClick={connectSse}>
                Connect
              </button>
              <button type="button" onClick={disconnectSse}>
                Close
              </button>
            </div>
          </div>

          {lastError ? (
            <div className="error-row">
              <ServerCrash size={18} />
              <span>{lastError}</span>
            </div>
          ) : null}

          <div className="event-list">
            {notifications.length === 0 ? (
              <EmptyState />
            ) : (
              notifications.map((notification) => (
                <article className="event-row" key={notification.eventId}>
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>{notification.data.message}</strong>
                    <span>
                      {notification.data.transactionId} ·{" "}
                      {new Date(notification.occurredAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <b>₹{notification.data.updatedBalance.toLocaleString("en-IN")}</b>
                </article>
              ))
            )}
          </div>
        </section>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <Activity size={22} />
          <h2>Pending Kafka Events</h2>
        </div>
        <div className="pending-grid">
          {pendingEvents.length === 0 ? (
            <p className="muted">No pending transaction events.</p>
          ) : (
            pendingEvents.map((item) => (
              <div className="pending-item" key={item.event.eventId}>
                <span>{item.event.data.status}</span>
                <strong>{item.event.data.transactionId}</strong>
                <small>
                  {item.event.data.type} · ₹
                  {item.event.data.amount.toLocaleString("en-IN")}
                </small>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="metric">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <Bell size={28} />
      <strong>No live notifications yet</strong>
      <span>Connect SSE, publish a transaction, and processed events appear here.</span>
    </div>
  );
}
