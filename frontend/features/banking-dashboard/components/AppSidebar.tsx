import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Settings,
  ShieldCheck,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import type { BankingView } from "../types";

interface AppSidebarProps {
  isOpen: boolean;
  transactionCount: number;
  activeView: BankingView;
  onNavigate: (view: BankingView) => void;
  onClose: () => void;
}

export function AppSidebar({
  isOpen,
  transactionCount,
  activeView,
  onNavigate,
  onClose,
}: AppSidebarProps) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? "nav-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Zap size={19} fill="currentColor" />
          </span>
          <span>Pulsebank</span>
          <button
            className="icon-button close-nav"
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          <button className={`nav-item ${activeView === "dashboard" ? "active" : ""}`} type="button" onClick={() => onNavigate("dashboard")}>
            <LayoutDashboard size={18} />
            Overview
          </button>
          <button className={`nav-item ${activeView === "transfer" ? "active" : ""}`} type="button" onClick={() => onNavigate("transfer")}>
            <ReceiptText size={18} />
            Transfer
            <span className="nav-count">{transactionCount}</span>
          </button>
          <button className="nav-item" type="button" onClick={() => onNavigate("dashboard")}>
            <WalletCards size={18} />
            Accounts
          </button>
          <button className={`nav-item ${activeView === "services" ? "active" : ""}`} type="button" onClick={() => onNavigate("services")}>
            <CreditCard size={18} />
            Services
          </button>
          <p className="nav-label nav-label-secondary">Manage</p>
          <button className={`nav-item ${activeView === "profile" ? "active" : ""}`} type="button" onClick={() => onNavigate("profile")}>
            <Settings size={18} />
            Profile & settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="security-note">
            <ShieldCheck size={18} />
            <div>
              <strong>Secure session</strong>
              <span>256-bit encrypted</span>
            </div>
          </div>
          <button className="profile-row" type="button" onClick={() => onNavigate("profile")}>
            <span className="avatar">AP</span>
            <span>
              <strong>Alex Parker</strong>
              <small>Operations</small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {isOpen ? (
        <button
          className="nav-scrim"
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
        />
      ) : null}
    </>
  );
}
