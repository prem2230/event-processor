import app from "./app";
import envConfig from "./config/env";
import { producer } from "./kafka/KafkaService";
import Logger from "./utils/logger";

class ApiGatewayServer {
  private static readonly logger = Logger;
  private static readonly producer = producer;
  private static readonly app = app;
  private static readonly port = Number(envConfig.port) || 3000;

  public static async start(): Promise<void> {
    await ApiGatewayServer.connectKafkaProducer();
    ApiGatewayServer.listen();
  }

  private static async connectKafkaProducer(): Promise<void> {
    ApiGatewayServer.logger.info("Connecting Kafka producer", {
      clientId: envConfig.kafkaClientId,
      broker: envConfig.kafkaBroker,
    });

    await ApiGatewayServer.producer.connect();

    ApiGatewayServer.logger.info("Kafka producer connected", {
      clientId: envConfig.kafkaClientId,
    });
  }

  private static listen(): void {
    ApiGatewayServer.app.listen(ApiGatewayServer.port, () => {
      ApiGatewayServer.logger.info("API Gateway started", {
        port: ApiGatewayServer.port,
      });
    });
  }

  public static handleStartupError(error: unknown): never {
    ApiGatewayServer.logger.error("API Gateway failed to start", {
      error: error instanceof Error ? error.message : String(error),
    });

    process.exit(1);
  }
}

void ApiGatewayServer.start().catch(ApiGatewayServer.handleStartupError);

export default ApiGatewayServer;
