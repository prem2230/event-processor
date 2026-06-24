import { Activity, Check, Clock3 } from "lucide-react";
import type { ReactNode } from "react";
import { connectionStatusLabels } from "../config";
import type { ConnectionStatus } from "../types";

interface MetricsGridProps {
  completedCount: number;
  connectionStatus: ConnectionStatus;
  pendingCount: number;
}

export function MetricsGrid({
  completedCount,
  connectionStatus,
  pendingCount,
}: MetricsGridProps) {
  return (
    <section className="metrics">
      <Metric
        icon={<Clock3 size={19} />}
        tone="amber"
        label="Pending"
        value={String(pendingCount)}
        detail="Awaiting processing"
      />
      <Metric
        icon={<Check size={19} />}
        tone="green"
        label="Completed"
        value={String(completedCount)}
        detail="Processed this session"
      />
      <Metric
        icon={<Activity size={19} />}
        tone="blue"
        label="Stream health"
        value={connectionStatus === "connected" ? "100%" : "--"}
        detail={connectionStatusLabels[connectionStatus]}
      />
    </section>
  );
}

interface MetricProps {
  detail: string;
  icon: ReactNode;
  label: string;
  tone: "amber" | "green" | "blue";
  value: string;
}

function Metric({ detail, icon, label, tone, value }: MetricProps) {
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
