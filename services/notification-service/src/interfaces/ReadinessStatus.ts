export interface ReadinessStatus {
    checks: {
        kafkaConsumer: boolean;
        sseManager: boolean;
    };
    ready: boolean;
}