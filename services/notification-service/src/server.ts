import app from "./app";
import envConfig from "./config/env";
import { startKafkaConsumer } from "./kafka/KafkaConsumer";

async function startServer(): Promise<void> {
    await startKafkaConsumer();

    const port = Number(envConfig.port);

    app.listen(port, () => {
        console.log(`Notification Service running on port ${port}`);
    });
}

void startServer().catch((error) => {
    console.error("Notification Service failed to start", error);
    process.exit(1);
});