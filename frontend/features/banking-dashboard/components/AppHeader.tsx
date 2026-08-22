import { Bell, Menu } from "lucide-react";
import { connectionStatusLabels } from "../config";
import type { ConnectionStatus } from "../types";

interface AppHeaderProps {
  connectionStatus: ConnectionStatus;
  hasNotifications: boolean;
  onOpenNavigation: () => void;
}

export function AppHeader({
  connectionStatus,
  hasNotifications,
  onOpenNavigation,
}: AppHeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <button
          className="icon-button menu-button"
          type="button"
          aria-label="Open navigation"
          onClick={onOpenNavigation}
        >
          <Menu size={21} />
        </button>
        <div>
          <p>Welcome back, Alex</p>
          <h1>Everyday banking</h1>
        </div>
      </div>
      <div className="topbar-actions">
        <div className={`connection-pill status-${connectionStatus}`}>
          <span className="connection-dot" />
          <span>{connectionStatusLabels[connectionStatus]}</span>
        </div>
        <button
          className="icon-button notification-button"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {hasNotifications ? <span /> : null}
        </button>
        <button className="mobile-avatar" type="button" aria-label="Open profile">
          AP
        </button>
      </div>
    </header>
  );
}
