# NovaPay Developer API (v1)

Base URL: `https://<host>/api/v1` · Auth: `X-API-Key: npk_…` header

Keys are scoped, rate-limited, and linked to exactly one NovaPay user — a key can only ever read or act on that user's data. Keys are created by admins in the Admin dashboard (Developer Platform section). The raw key is shown **once** at creation.

## Scopes

| Scope | Grants |
|---|---|
| `accounts.read` | `GET /v1/accounts` |
| `balance.read` | `GET /v1/balance?accountId=` |
| `transfers.write` | `POST /v1/transfers` |
| `mandates.write` | `POST /v1/mandates` |

Rate limit default: 30 requests/min per key (`429` when exceeded, `Retry-After` header).

## Endpoints

### GET /accounts
```json
{ "data": [{ "id": "…", "type": "SAVINGS", "currency": "INR", "accountNumber": "****5678" }] }
```

### GET /balance?accountId=
```json
{ "accountId": "…", "balance": 123456.78, "currency": "INR", "asOf": "…" }
```
Errors: `404 Account not found` (or outside key scope).

### POST /transfers
```json
{ "fromAccountId": "…", "toAccountNumber": "****1234", "amount": 500.25, "dedupeKey": "your-idempotency-key", "note": "optional" }
```
- `201` → `{ reference, amount(-ve debit), status, createdAt }`
- Duplicate `dedupeKey` → `200 { duplicate: true, reference }` (no second movement)
- Errors: `404 SOURCE_NOT_FOUND`, `400 INSUFFICIENT`, `400 Invalid amount`
Fires webhook **transaction.completed**.

### POST /mandates
```json
{ "name": "Gym", "amount": 1500, "frequency": "MONTHLY", "accountId": "…" }
```
→ `201` mandate object. Fires **mandate.failed** on future failed auto-debits.

## Webhooks

Register callback URLs in the admin panel. Deliveries are `POST`ed with headers:
```
X-NovaPay-Event: transaction.completed
X-NovaPay-Signature: t=<unix-ms>,v1=<hex hmac>
```
Verify with `HMAC_SHA256(secret, "<t>.<body>")`.

**Simulation note:** deliveries originate from the NovaPay simulation environment; amounts are simulated INR.

## Security model

- Keys are stored as SHA-256 hashes; raw keys are unrecoverable.
- Every request is rate-limited per-key and written to an audit log visible in the admin dashboard.
- Ownership is enforced server-side via the key's linked user — cross-user access is structurally impossible regardless of scopes.
