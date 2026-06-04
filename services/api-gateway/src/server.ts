import app from "./app";
import envConfig from "./config/env";
import { producer } from "./kafka/KafkaService";

async function startServer(): Promise<void> {
  await producer.connect();

  const port = Number(envConfig.port) || 3000;

  app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
  });
}

void startServer().catch((error) => {
  console.error("API Gateway failed to start", error);
  process.exit(1);
});
