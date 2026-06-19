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

interface AppSidebarProps {
  isOpen: boolean;
  transactionCount: number;
  onClose: () => void;
}

export function AppSidebar({
  isOpen,
  transactionCount,
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
          <a className="nav-item active" href="#overview">
            <LayoutDashboard size={18} />
            Overview
          </a>
          <a className="nav-item" href="#transactions">
            <ReceiptText size={18} />
            Transactions
            <span className="nav-count">{transactionCount}</span>
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
