import type { ProducerRecord } from "kafkajs";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import KafkaService from "../../src/kafka/KafkaService";

jest.mock("kafkajs", () => {
  const producer = {
    connect: jest.fn<() => Promise<void>>(),
    send: jest.fn<() => Promise<void>>(),
  };

  return {
    Kafka: jest.fn().mockImplementation(() => ({
      producer: jest.fn().mockReturnValue(producer),
    })),
    Partitioners: {
      LegacyPartitioner: jest.fn(),
    },
    __producer: producer,
  };
});

describe("KafkaService", () => {
  const producer = (
    jest.requireMock("kafkajs") as {
      __producer: {
        connect: jest.Mock<() => Promise<void>>;
        send: jest.Mock<() => Promise<void>>;
      };
    }
  ).__producer;

  beforeEach(() => {
    jest.clearAllMocks();
    producer.connect.mockResolvedValue(undefined);
    producer.send.mockResolvedValue(undefined);
  });

  it("connects the Kafka producer and reports readiness", async () => {
    await KafkaService.connect();

    expect(producer.connect).toHaveBeenCalledTimes(1);
    expect(KafkaService.isReady()).toBe(true);
  });

  it("publishes transaction created events", async () => {
    await KafkaService.publishTransactionCreated({
      eventId: "event-1",
      eventType: "transaction.created",
      occurredAt: "2026-06-28T00:00:00.000Z",
      data: {
        transactionId: "txn-1",
        userId: "user-101",
        accountId: "acc-1",
        type: "CREDIT",
        amount: 100,
        status: "PENDING",
      },
    });

    const sentRecord = producer.send.mock.calls[0]?.[0] as ProducerRecord;

    expect(sentRecord.messages[0]?.key).toBe("acc-1");
    expect(sentRecord.messages[0]?.value).toContain('"eventId":"event-1"');
  });
});
