"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Building2, Landmark, ShieldCheck, UserRound } from "lucide-react";
import { apiGatewayUrl } from "./config";
import { AccountSummary } from "./components/AccountSummary";
import { ActivityPanel } from "./components/ActivityPanel";
import { AppHeader } from "./components/AppHeader";
import { AppSidebar } from "./components/AppSidebar";
import { MetricsGrid } from "./components/MetricsGrid";
import { TransactionForm } from "./components/TransactionForm";
import { useBankingConsole } from "./hooks/useBankingConsole";
import type { BankingView } from "./types";

interface Session {
  accessToken: string;
  user: { userId: string; firstName: string; lastName: string; email: string; dateOfBirth?: string; address?: string };
}

export function BankingDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => { const saved = window.localStorage.getItem("pulsebank.session"); if (saved) setSession(JSON.parse(saved) as Session); }, []);
  if (!session) return <LoginPage onAuthenticated={(next) => { window.localStorage.setItem("pulsebank.session", JSON.stringify(next)); setSession(next); }} />;
  return <AuthenticatedBanking session={session} onLogout={() => { window.localStorage.removeItem("pulsebank.session"); setSession(null); }} />;
}

function AuthenticatedBanking({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [activeView, setActiveView] = useState<BankingView>("dashboard");
  const banking = useBankingConsole(session.accessToken, session.user.userId);
  const transactions = banking.pendingEvents.length + banking.notifications.length;
  return <main className="app-shell"><AppSidebar activeView={activeView} isOpen={isNavigationOpen} transactionCount={transactions} onClose={() => setIsNavigationOpen(false)} onNavigate={(view) => { setActiveView(view); setIsNavigationOpen(false); }} /><section className="main-area"><AppHeader connectionStatus={banking.connectionStatus} hasNotifications={banking.notifications.length > 0} onOpenNavigation={() => setIsNavigationOpen(true)} /><div className="dashboard">{activeView !== "services" && activeView !== "profile" ? <AccountSummary accountId={banking.accountId} balance={banking.latestBalance} /> : null}{activeView === "dashboard" ? <><MetricsGrid completedCount={banking.notifications.length} connectionStatus={banking.connectionStatus} pendingCount={banking.pendingEvents.length} /><section className="content-grid"><TransactionForm {...transactionProps(banking)} /><ActivityPanel {...activityProps(banking)} /></section></> : null}{activeView === "transfer" ? <section className="content-grid"><TransactionForm {...transactionProps(banking)} /><ActivityPanel {...activityProps(banking)} /></section> : null}{activeView === "services" ? <ServicesPage /> : null}{activeView === "profile" ? <ProfilePage user={session.user} onLogout={onLogout} /> : null}</div></section></main>;
}

function transactionProps(state: ReturnType<typeof useBankingConsole>) { return { accountId: state.accountId, amount: state.amount, isSubmitting: state.isSubmitting, type: state.type, userId: state.userId, onAccountIdChange: state.setAccountId, onAmountChange: state.setAmount, onSubmit: state.submitTransaction, onTypeChange: state.setType, onUserIdChange: state.setUserId }; }
function activityProps(state: ReturnType<typeof useBankingConsole>) { return { connectionStatus: state.connectionStatus, error: state.lastError, notifications: state.notifications, pendingEvents: state.pendingEvents }; }
function ServicesPage() { return <section className="service-grid" aria-label="Banking services"><ServiceCard icon={<Landmark size={22} />} title="Open a deposit" copy="Earn more with a fixed deposit tailored to your goal." /><ServiceCard icon={<ShieldCheck size={22} />} title="Card controls" copy="Freeze, replace or set limits on your debit cards." /><ServiceCard icon={<Building2 size={22} />} title="Pay bills" copy="Set up utilities and recurring payments in one place." /></section>; }
function ServiceCard({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) { return <article className="service-card"><span>{icon}</span><h2>{title}</h2><p>{copy}</p><button className="secondary-action" type="button">Explore</button></article>; }
function ProfilePage({ user, onLogout }: { user: Session["user"]; onLogout: () => void }) { return <section className="profile-panel"><span className="profile-large-avatar"><UserRound size={30} /></span><div><span className="section-kicker">Customer profile</span><h2>{user.firstName} {user.lastName}</h2><p>{user.userId} · {user.email}</p></div><dl><div><dt>Date of birth</dt><dd>{user.dateOfBirth || "Not provided"}</dd></div><div><dt>Address</dt><dd>{user.address || "Not provided"}</dd></div><div><dt>Session</dt><dd>Secure · active now</dd></div></dl><button className="secondary-action" type="button" onClick={onLogout}>Log out</button></section>; }
function LoginPage({ onAuthenticated }: { onAuthenticated: (session: Session) => void }) { const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false); const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitting(true); setError(null); try { const response = await fetch(`${apiGatewayUrl}/v1/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }); if (!response.ok) throw new Error("Email or password is incorrect."); const payload = (await response.json()) as { accessToken: string; user: Session["user"] }; onAuthenticated({ accessToken: payload.accessToken, user: payload.user }); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not sign in."); } finally { setSubmitting(false); } }; return <main className="login-shell"><form className="login-card" onSubmit={submit}><span className="brand-mark"><Landmark size={22} /></span><h1>Welcome to Pulsebank</h1><p>Sign in to securely manage your accounts and transfers.</p><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{error ? <div className="error-row" role="alert">{error}</div> : null}<button className="primary-action" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button></form></main>; }
