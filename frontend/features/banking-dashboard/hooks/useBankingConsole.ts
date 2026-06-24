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

export function useBankingConsole() {
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

  const latestBalance = useMemo(
    () => notifications[0]?.data.updatedBalance ?? 0,
    [notifications]
  );

  const disconnectStream = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setConnectionStatus("idle");
  }, []);

  const connectStream = useCallback(() => {
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
  }, [userId]);

  const submitTransaction = useCallback(async () => {
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
      setPendingEvents((current) =>
        [payload, ...current].slice(0, maxPendingEvents)
      );
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [accountId, amount, type, userId]);

  useEffect(() => {
    return () => eventSourceRef.current?.close();
  }, []);

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
