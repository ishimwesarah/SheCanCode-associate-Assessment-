
# SheCanCode Associate Assessment
## Overview
This project implements an **Idempotency Gateway** for payment processing using **Node.js/Express**.  
It ensures that duplicate requests with the same `Idempotency-Key` return cached responses, preventing double charges.  
It also includes fraud detection (same key, different body), in‑flight request handling, and a developer’s choice feature: **key expiration**.

---

## Architecture
1. **Client** sends a payment request with headers:
   - `Content-Type: application/json`
   - `Idempotency-Key: <unique-key>`
2. **Middleware** checks if the key exists:
   - If new → mark as processing, save request body.
   - If duplicate with same body → return cached response (`X-Cache-Hit: true`).
   - If duplicate with different body → return error `422`.
   - If in‑flight → second request waits until first finishes.
3. **Store** is an in‑memory `Map` with auto‑expiration (10 minutes).
4. **Server** simulates payment processing with a 2‑second delay.

---

## 🔄 Flowchart
The diagram below illustrates how a client request flows through the Express server, the idempotency middleware, and the in‑memory store before reaching the payment processor and returning a response.

```markdown
Client
   |
   v
[Express Server]
   |
   v
[Idempotency Middleware] ---> [In-Memory Map Store]
   |                               |
   |                               v
   |                        Cached Response
   v
Payment Processing (2s delay)
   |
   v
Response to Client

```

## Setup Instructions
### Prerequisites
- Node.js v18+
- npm v9+
- Postman (for testing)

### Installation
```bash
git clone https://github.com/ishimwesarah/SheCanCode-associate-Assessment-.git
cd SheCanCode-associate-Assessment-
npm install
```

### Run the Server
```bash
npm start
```
or with auto‑reload:
```bash
npm run dev
```

---

## API Documentation

### Endpoint
`POST /process-payment`

### Headers
| Key              | Value              |
|------------------|--------------------|
| Content-Type     | application/json   |
| Idempotency-Key  | abc123             |

### Body Example
```json
{ "amount": 100, "currency": "GHS" }
```

### Responses
- **201 Created**  
  ```json
  { "message": "Charged 100 GHS" }
  ```
- **201 Cached** (duplicate request)  
  Header: `X-Cache-Hit: true`
- **422 Fraud/Error** (same key, different body)  
  ```json
  { "error": "Idempotency key already used for a different request body." }
  ```

---

## Testing in Postman
1. **Happy Path** → Send new request with unique key → `201 Created`.
2. **Duplicate Request** → Send same request again → instant cached response with `X-Cache-Hit: true`.
3. **Fraud/Error** → Same key, different body → `422 Unprocessable Entity`.
4. **In‑Flight** → Two requests at same time → second waits until first finishes.
5. **Key Expiration** → After 10 minutes, same key behaves like new.

---

## Design Decisions
- **In‑Memory Map**: Simple, fast, and sufficient for demo purposes.
- **Fraud Detection**: Compares request body against stored body.
- **In‑Flight Handling**: Queues concurrent requests until first completes.
- **Expiration Feature**: Keys auto‑delete after 10 minutes to prevent memory leaks.

---

## Developer’s Choice Feature
**Key Expiration**: Each idempotency key is automatically removed after 10 minutes.  
This ensures memory stays clean and keys don’t persist forever.

---



