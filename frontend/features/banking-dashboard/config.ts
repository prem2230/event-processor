import type { ConnectionStatus } from "./types";

export const apiGatewayUrl =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3000";

export const notificationUrl =
  process.env.NEXT_PUBLIC_NOTIFICATION_URL || "http://localhost:3002";

export const connectionStatusLabels: Record<ConnectionStatus, string> = {
  idle: "Offline",
  connecting: "Connecting",
  connected: "Live",
  error: "Connection issue",
};
