"use client";

import { useState } from "react";
import { AccountSummary } from "./components/AccountSummary";
import { ActivityPanel } from "./components/ActivityPanel";
import { AppHeader } from "./components/AppHeader";
import { AppSidebar } from "./components/AppSidebar";
import { MetricsGrid } from "./components/MetricsGrid";
import { TransactionForm } from "./components/TransactionForm";
import { useBankingConsole } from "./hooks/useBankingConsole";

export function BankingDashboard() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const consoleState = useBankingConsole();
  const transactionCount =
    consoleState.pendingEvents.length + consoleState.notifications.length;

  return (
    <main className="app-shell">
      <AppSidebar
        isOpen={isNavigationOpen}
        transactionCount={transactionCount}
        onClose={() => setIsNavigationOpen(false)}
      />

      <section className="main-area">
        <AppHeader
          connectionStatus={consoleState.connectionStatus}
          hasNotifications={consoleState.notifications.length > 0}
          onOpenNavigation={() => setIsNavigationOpen(true)}
        />

        <div className="dashboard" id="overview">
          <AccountSummary
            accountId={consoleState.accountId}
            balance={consoleState.latestBalance}
          />
          <MetricsGrid
            completedCount={consoleState.notifications.length}
            connectionStatus={consoleState.connectionStatus}
            pendingCount={consoleState.pendingEvents.length}
          />

          <section className="content-grid">
            <TransactionForm
              accountId={consoleState.accountId}
              amount={consoleState.amount}
              isSubmitting={consoleState.isSubmitting}
              type={consoleState.type}
              userId={consoleState.userId}
              onAccountIdChange={consoleState.setAccountId}
              onAmountChange={consoleState.setAmount}
              onSubmit={consoleState.submitTransaction}
              onTypeChange={consoleState.setType}
              onUserIdChange={consoleState.setUserId}
            />
            <ActivityPanel
              connectionStatus={consoleState.connectionStatus}
              error={consoleState.lastError}
              notifications={consoleState.notifications}
              pendingEvents={consoleState.pendingEvents}
              userId={consoleState.userId}
              onConnect={consoleState.connectStream}
              onDisconnect={consoleState.disconnectStream}
            />
          </section>
        </div>
      </section>
    </main>
  );
}
