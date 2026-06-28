import { DependencyHealth } from "./DependencyHealth";

export interface ReadinessStatus {
    checks: DependencyHealth;
    ready: boolean;
}