# Real-Time Event Processing Platform

A TypeScript microservice project that simulates an enterprise banking transaction flow using Kafka, MongoDB, Redis, Express, SSE, Docker, and a Next.js frontend.

## Architecture

```txt
Frontend
  -> API Gateway
  -> Kafka topic: transaction.created
  -> Event Processor
  -> MongoDB transaction write
  -> Redis balance update
  -> Kafka topic: notification.created
  -> Notification Service
  -> SSE live update
  -> Frontend
```

## Services

```txt
services/api-gateway
```

Receives transaction requests, validates payloads, and publishes `transaction.created` events to Kafka.

```txt
services/event-processor
```

Consumes `transaction.created`, saves completed transactions in MongoDB, updates Redis account balances, and publishes `notification.created`.

```txt
services/notification-service
```

Consumes `notification.created` and pushes real-time updates to connected frontend clients through Server-Sent Events.

```txt
frontend
```

Next.js dashboard for creating transactions, connecting to SSE, and viewing live status updates.

## Event Flow

```txt
POST /v1/api/transactions
  -> transaction.created
  -> process transaction
  -> save transaction
  -> update account:{accountId}:balance
  -> notification.created
  -> GET /v1/api/events/:userId
```

## Kafka Topics

```txt
transaction.created
notification.created
```

Future topics:

```txt
transaction.failed
fraud.detected
account.balance.updated
```

## Local Ports

```txt
API Gateway:          http://localhost:3000
Notification Service: http://localhost:3002
Frontend:             http://localhost:3003
Kafka:                localhost:9092
MongoDB:              localhost:27017
Redis:                localhost:6379
```

## Run Locally

Start infrastructure first:

```bash
docker compose up -d
```

Run API Gateway:

```bash
cd services/api-gateway
npm install
npm run dev
```

Run Event Processor:

```bash
cd services/event-processor
npm install
npm run dev
```

Run Notification Service:

```bash
cd services/notification-service
npm install
npm run dev
```

Run Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```txt
http://localhost:3003
```

## API Example

```http
POST http://localhost:3000/v1/api/transactions
Content-Type: application/json
```

```json
{
  "userId": "user-101",
  "accountId": "acc-5001",
  "type": "CREDIT",
  "amount": 2500
}
```

## SSE Endpoint

```txt
GET http://localhost:3002/v1/api/events/user-101
```

## Quality Gates

Each backend service supports:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run validate
```

Frontend supports:

```bash
npm run typecheck
npm run build
npm run validate
```

## Resume Summary

Built a real-time event-driven banking transaction platform using Node.js, TypeScript, Kafka, Redis, MongoDB, Docker, SSE, Express, and Next.js. The system demonstrates asynchronous microservice communication, event processing, database persistence, cache updates, and live frontend notifications.
