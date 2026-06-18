"use client";

import {
  Activity,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  CircleDollarSign,
  Clock3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Plug,
  Radio,
  ReceiptText,
  RefreshCw,
  Send,
  ServerCrash,
  Settings,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
  Zap,
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

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const statusLabels: Record<ConnectionStatus, string> = {
  idle: "Offline",
  connecting: "Connecting",
  connected: "Live",
  error: "Connection issue",
};

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
  const [isNavOpen, setIsNavOpen] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const latestBalance = useMemo(
    () => notifications[0]?.data.updatedBalance ?? 0,
    [notifications]
  );

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
      setLastError("The event stream disconnected. Check the notification service.");
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
    <main className="app-shell">
      <aside className={`sidebar ${isNavOpen ? "nav-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Zap size={19} fill="currentColor" />
          </span>
          <span>Pulsebank</span>
          <button
            className="icon-button close-nav"
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsNavOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          <a className="nav-item active" href="#overview">
            <LayoutDashboard size={18} />
            Overview
          </a>
          <a className="nav-item" href="#transactions">
            <ReceiptText size={18} />
            Transactions
            <span className="nav-count">
              {pendingEvents.length + notifications.length}
            </span>
          </a>
          <a className="nav-item" href="#accounts">
            <WalletCards size={18} />
            Accounts
          </a>
          <a className="nav-item" href="#cards">
            <CreditCard size={18} />
            Cards
          </a>
          <p className="nav-label nav-label-secondary">Manage</p>
          <a className="nav-item" href="#settings">
            <Settings size={18} />
            Settings
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="security-note">
            <ShieldCheck size={18} />
            <div>
              <strong>Secure session</strong>
              <span>256-bit encrypted</span>
            </div>
          </div>
          <button className="profile-row" type="button">
            <span className="avatar">AP</span>
            <span>
              <strong>Alex Parker</strong>
              <small>Operations</small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {isNavOpen ? (
        <button
          className="nav-scrim"
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsNavOpen(false)}
        />
      ) : null}

      <section className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="icon-button menu-button"
              type="button"
              aria-label="Open navigation"
              onClick={() => setIsNavOpen(true)}
            >
              <Menu size={21} />
            </button>
            <div>
              <p>Thursday, 18 June</p>
              <h1>Banking Event Console</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <div className={`connection-pill status-${connectionStatus}`}>
              <span className="connection-dot" />
              <span>{statusLabels[connectionStatus]}</span>
            </div>
            <button className="icon-button notification-button" type="button" aria-label="Notifications">
              <Bell size={20} />
              {notifications.length > 0 ? <span /> : null}
            </button>
            <button className="mobile-avatar" type="button" aria-label="Open profile">
              AP
            </button>
          </div>
        </header>

        <div className="dashboard" id="overview">
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
              <strong>{currency.format(latestBalance)}</strong>
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

          <section className="metrics">
            <Metric
              icon={<Clock3 size={19} />}
              tone="amber"
              label="Pending"
              value={String(pendingEvents.length)}
              detail="Awaiting processing"
            />
            <Metric
              icon={<Check size={19} />}
              tone="green"
              label="Completed"
              value={String(notifications.length)}
              detail="Processed this session"
            />
            <Metric
              icon={<Activity size={19} />}
              tone="blue"
              label="Stream health"
              value={connectionStatus === "connected" ? "100%" : "--"}
              detail={statusLabels[connectionStatus]}
            />
          </section>

          <section className="content-grid">
            <form className="transfer-panel" onSubmit={createTransaction}>
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
                  onClick={() => setType("CREDIT")}
                >
                  <ArrowDownLeft size={17} />
                  Credit
                </button>
                <button
                  className={type === "DEBIT" ? "active" : ""}
                  type="button"
                  onClick={() => setType("DEBIT")}
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
                    onChange={(event) => setUserId(event.target.value)}
                  />
                </span>
              </label>

              <label>
                Account ID
                <span className="input-wrap">
                  <WalletCards size={17} />
                  <input
                    value={accountId}
                    onChange={(event) => setAccountId(event.target.value)}
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
                    onChange={(event) => setAmount(event.target.value)}
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
                      onClick={disconnectSse}
                    >
                      <X size={16} />
                      Close
                    </button>
                  ) : (
                    <button
                      className="secondary-action connect-action"
                      type="button"
                      onClick={connectSse}
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

              {lastError ? (
                <div className="error-row" role="alert">
                  <ServerCrash size={18} />
                  <span>{lastError}</span>
                </div>
              ) : null}

              <div className="event-list">
                {notifications.length === 0 && pendingEvents.length === 0 ? (
                  <EmptyState onConnect={connectSse} />
                ) : (
                  <>
                    {notifications.map((notification) => (
                      <article className="event-row" key={notification.eventId}>
                        <span
                          className={`transaction-icon ${
                            notification.data.status === "FAILED" ? "failed" : ""
                          }`}
                        >
                          {notification.data.status === "FAILED" ? (
                            <X size={18} />
                          ) : (
                            <ArrowDownLeft size={18} />
                          )}
                        </span>
                        <div className="event-copy">
                          <strong>{notification.data.message}</strong>
                          <span>
                            {notification.data.transactionId} ·{" "}
                            {new Date(notification.occurredAt).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        </div>
                        <div className="event-value">
                          <strong>{currency.format(notification.data.updatedBalance)}</strong>
                          <span className={`event-status ${notification.data.status.toLowerCase()}`}>
                            {notification.data.status}
                          </span>
                        </div>
                      </article>
                    ))}
                    {pendingEvents.map((item) => (
                      <article className="event-row pending-row" key={item.event.eventId}>
                        <span className="transaction-icon pending">
                          <Clock3 size={18} />
                        </span>
                        <div className="event-copy">
                          <strong>
                            {item.event.data.type === "CREDIT"
                              ? "Incoming credit"
                              : "Outgoing debit"}
                          </strong>
                          <span>
                            {item.event.data.transactionId} · just now
                          </span>
                        </div>
                        <div className="event-value">
                          <strong>
                            {item.event.data.type === "DEBIT" ? "-" : "+"}
                            {currency.format(item.event.data.amount)}
                          </strong>
                          <span className="event-status pending">PENDING</span>
                        </div>
                      </article>
                    ))}
                  </>
                )}
              </div>
            </section>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({
  icon,
  tone,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  tone: "amber" | "green" | "blue";
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="metric">
      <span className={`metric-icon ${tone}`}>{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
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
