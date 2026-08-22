"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiGatewayUrl, notificationUrl } from "../config";
import type {
  ConnectionStatus,
  NotificationEvent,
  TransactionResponse,
  TransactionType,
} from "../types";

const maxNotifications = 20;
const maxPendingEvents = 10;

export function useBankingConsole(token: string, authenticatedUserId: string) {
  const [userId, setUserId] = useState(authenticatedUserId);
  const [accountId, setAccountId] = useState("");
  const [type, setType] = useState<TransactionType>("DEBIT");
  const [amount, setAmount] = useState("2500");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [pendingEvents, setPendingEvents] = useState<TransactionResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const latestBalance = useMemo(
    () =>
      notifications.find((event) => event.data.status === "COMPLETED")
        ?.data.updatedBalance ?? 0,
    [notifications]
  );

  const disconnectStream = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setConnectionStatus("idle");
  }, []);

  const connectStream = useCallback(() => {
    if (!authenticatedUserId) return;
    eventSourceRef.current?.close();
    setConnectionStatus("connecting");
    setLastError(null);

    const source = new EventSource(
      `${notificationUrl}/v1/api/events/${encodeURIComponent(authenticatedUserId)}`
    );

    source.addEventListener("connected", () => {
      setConnectionStatus("connected");
    });

    source.addEventListener("notification", (event) => {
      const notification = JSON.parse(event.data) as NotificationEvent;

      setNotifications((current) =>
        [notification, ...current].slice(0, maxNotifications)
      );
      setPendingEvents((current) =>
        current.filter(
          (item) =>
            item.event.data.transactionId !== notification.data.transactionId
        )
      );
    });

    source.onerror = () => {
      setConnectionStatus("error");
      setLastError(
        "The event stream disconnected. Check the notification service."
      );
      source.close();
    };

    eventSourceRef.current = source;
  }, [authenticatedUserId]);

  const submitTransaction = useCallback(async () => {
    setIsSubmitting(true);
    setLastError(null);

    try {
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(`${apiGatewayUrl}/v1/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sourceAccountId: accountId,
          destinationAccountId: userId,
          amount: Number(amount),
          currency: "INR",
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await response.json();
      // The payment response is intentionally not rendered. The authenticated
      // SSE stream is the single UI feed for INITIATED/COMPLETED/FAILED states.
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [accountId, amount, token, userId]);

  useEffect(() => {
    setUserId(authenticatedUserId);
    if (!token || !authenticatedUserId) return;
    void (async () => {
      try {
        const response = await fetch(`${apiGatewayUrl}/v1/api/accounts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Could not load your accounts");
        const accounts = (await response.json()) as Array<{ accountId: string; availableBalance: number }>;
        if (accounts[0]) setAccountId(accounts[0].accountId);
        else setLastError("No active account is available for transfers.");
      } catch (error) {
        setLastError(error instanceof Error ? error.message : "Could not load your accounts");
      }
    })();
    connectStream();
    return () => eventSourceRef.current?.close();
  }, [authenticatedUserId, connectStream, token]);

  return {
    accountId,
    amount,
    connectionStatus,
    connectStream,
    disconnectStream,
    isSubmitting,
    lastError,
    latestBalance,
    notifications,
    pendingEvents,
    setAccountId,
    setAmount,
    setType,
    setUserId,
    submitTransaction,
    type,
    userId,
  };
}
