# Real-Time Event Processing Platform

A TypeScript microservice project that simulates an enterprise banking transaction flow using Kafka, MongoDB, Express, SSE, Docker, and a Next.js frontend.

## Architecture

```txt
Frontend
  -> API Gateway
       -> User Service
       -> Account Service
  -> Account balance update
  -> Kafka topic: transaction.created
  -> Event Processor
  -> MongoDB transaction write
  -> Kafka topic: notification.created
  -> Notification Service
  -> SSE live update
  -> Frontend
```

## Services

```txt
services/api-gateway
```

Terminates public authentication, issues and validates JWT access tokens, verifies
account ownership, routes user/account requests, and publishes
`transaction.created` events to Kafka.

```txt
services/user-service
```

Owns user profiles, password hashing, registration, and credential verification.
Passwords use `scrypt` with per-user salts and are never returned by the API.

```txt
services/account-service
```

Owns bank account metadata and user-to-account ownership. Account lookups are
always scoped to the authenticated user.

```txt
services/event-processor
```

Consumes `transaction.created`, saves completed transactions in MongoDB, and publishes `notification.created`.

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
  -> validate JWT
  -> verify account ownership
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
User Service:         http://localhost:3004
Account Service:      http://localhost:3005
Kafka:                localhost:9092
MongoDB:              localhost:27017
```

## Environment Files

Each backend service loads environment variables from a service-local `.env`
file. Copy the examples before running locally:

```bash
cp services/api-gateway/.env.example services/api-gateway/.env
cp services/user-service/.env.example services/user-service/.env
cp services/account-service/.env.example services/account-service/.env
cp services/event-processor/.env.example services/event-processor/.env
cp services/notification-service/.env.example services/notification-service/.env
```

On Windows PowerShell, use `Copy-Item` instead of `cp` if needed.

The `INTERNAL_SERVICE_TOKEN` value must be identical in the API Gateway, User
Service, and Account Service. For production, replace all placeholder secrets,
including `JWT_SECRET`, with strong private values.

Docker Compose uses the root `.env` file. Copy the root example and replace the
MongoDB URLs with your remote databases:

```bash
cp .env.example .env
```

## Run Locally

Run the backend stack with Docker Compose:

```bash
docker compose up --build
```

This starts Kafka, creates the required Kafka topics, and runs all
backend services. MongoDB is expected to be remote and configured through the
root `.env` file. The frontend can still be run separately with `npm run dev`
from the `frontend` directory.

For manual backend development, start only shared infrastructure:

```bash
docker compose up -d kafka kafka-init
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

Run User Service:

```bash
cd services/user-service
npm install
npm run dev
```

Run Account Service:

```bash
cd services/account-service
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

## Authentication

Register:

```http
POST http://localhost:3000/v1/api/auth/register
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "firstName": "Test",
  "lastName": "User"
}
```

Login:

```http
POST http://localhost:3000/v1/api/auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

The login response contains a short-lived Bearer access token.

## Account API

```http
POST http://localhost:3000/v1/api/accounts
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "type": "CURRENT",
  "currency": "INR"
}
```

## Transaction API

```http
POST http://localhost:3000/v1/api/transactions
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "accountId": "<account-id>",
  "type": "CREDIT",
  "amount": 2500
}
```

The gateway derives `userId` from the verified JWT. Client-supplied identity is
never trusted.

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

## Security Boundaries

- API Gateway is the only public entry point for user and account APIs.
- JWTs are signed with HS256 and validated for algorithm, issuer, audience, and
  expiration.
- User and Account services require `X-Internal-Service-Token`.
- Production startup rejects the local default JWT and internal service secrets.
- HTTPS certificates are validated by Node for `https://` upstream URLs. TLS
  should normally terminate at the ingress/load balancer, while internal traffic
  can use private networking or service-mesh mTLS.
- Never commit production JWT secrets, internal tokens, database credentials, or
  TLS private keys.

Frontend supports:

```bash
npm run typecheck
npm run build
npm run validate
```

## Resume Summary

Built a real-time event-driven banking transaction platform using Node.js, TypeScript, Kafka, MongoDB, Docker, SSE, Express, and Next.js. The system demonstrates asynchronous microservice communication, event processing, database persistence, account balance updates, and live frontend notifications.

