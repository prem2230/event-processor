event-processor/
├── services/
│   ├── api-gateway/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   └── server.js
│   │   └── package.json
│   │
│   ├── transaction-producer/
│   │   ├── src/
│   │   │   ├── producers/
│   │   │   └── index.js
│   │   └── package.json
│   │
│   ├── event-processor/
│   │   ├── src/
│   │   │   ├── consumers/
│   │   │   ├── processors/
│   │   │   ├── services/
│   │   │   └── index.js
│   │   └── package.json
│   │
│   ├── notification-service/
│   │   ├── src/
│   │   │   ├── websocket/
│   │   │   ├── sse/
│   │   │   └── index.js
│   │   └── package.json
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── shared/
│   ├── events/
│   ├── constants/
│   └── utils/
│
├── infra/
│   ├── docker-compose.yml
│   ├── kafka/
│   ├── redis/
│   ├── mongo/
│   └── k8s/
│
├── docs/
│   ├── architecture.md
│   ├── event-flow.md
│   └── api.md
│
├── README.md
└── .env.example


User/API triggers transaction
        ↓
API Gateway receives request
        ↓
Transaction Producer sends event to Kafka
        ↓
Event Processor consumes Kafka event
        ↓
Processor validates + enriches event
        ↓
MongoDB stores transaction history
        ↓
Redis updates latest account/cache state
        ↓
Notification Service pushes live update
        ↓
Frontend updates instantly

transaction.created
transaction.processed
transaction.failed
fraud.detected
account.balance.updated
notification.created

users
accounts
transactions
event_logs
fraud_alerts
notifications

account:{accountId}:balance
user:{userId}:recent-transactions
fraud:{userId}:risk-score
live:notifications:{userId}


Node.js services
Express API
MongoDB connection
Redis connection
Kafka producer/consumer
Docker Compose

POST /transactions
→ Kafka event
→ Consumer receives event
→ Save to MongoDB

transaction validation
balance update logic
failed transaction handling
event status tracking
retry logic
dead-letter topic

PENDING
PROCESSING
COMPLETED
FAILED
FLAGGED

Transaction completed
Balance updated
Fraud alert detected
Notification generated

idempotency keys
request correlation IDs
centralized logging
rate limiting
schema validation
Kafka retry topics
dead-letter queue
health checks
metrics endpoint

api-gateway
transaction-producer
event-processor
notification-service
mongo
redis
kafka
zookeeper
frontend

Deployments
Services
ConfigMaps
Secrets
Ingress
HorizontalPodAutoscaler

Best MVP Version

If you want to finish this strongly, build this MVP first:

1. Create transaction from API
2. Publish transaction.created event to Kafka
3. Consume event in processor
4. Save transaction to MongoDB
5. Update balance in Redis
6. Push live status to frontend using SSE
7. Show transaction timeline in UI
