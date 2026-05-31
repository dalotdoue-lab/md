# Let Investments - API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.letinvestments.com/api
```

---

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+254700123456",
  "company": "Acme Ltd",
  "country": "Kenya"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "client"
  }
}
```

---

## Companies

### Get All Companies
```http
GET /companies
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sector | string | Filter by sector |
| region | string | Filter by region |
| search | string | Search by name/symbol |
| limit | number | Pagination limit |
| offset | number | Pagination offset |

### Get Company by ID
```http
GET /companies/:id
```

### Get Company by Symbol
```http
GET /companies/symbol/:ticker
```

### Get Stock History
```http
GET /companies/:id/history?days=30
```

---

## Investments

### Get User Portfolio
```http
GET /investments
Authorization: Bearer <token>
```

### Buy Shares
```http
POST /investments/buy
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyId": "uuid",
  "amount": 1000.00
}
```

### Sell Shares
```http
POST /investments/sell
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyId": "uuid",
  "shares": 10
}
```

---

## Wallet

### Get Wallet Balance
```http
GET /wallet
Authorization: Bearer <token>
```

### Deposit Funds
```http
POST /wallet/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000.00,
  "provider": "bank",
  "description": "Initial deposit"
}
```

### Withdraw Funds
```http
POST /wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500.00,
  "provider": "bank"
}
```

### Get Transactions
```http
GET /wallet/transactions
Authorization: Bearer <token>
```

---

## Market Insights

### Get All Insights
```http
GET /insights
```

### Get Featured Insights
```http
GET /insights/featured
```

### Get Insight by Slug
```http
GET /insights/:slug
```

---

## Products

### Get All Products
```http
GET /products
```

### Get Product by ID
```http
GET /products/:id
```

### Create Order
```http
POST /products/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "productId": "uuid", "quantity": 2 }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "address": "123 Main St",
    "city": "Nairobi",
    "state": "Nairobi",
    "postalCode": "00100",
    "country": "Kenya",
    "phone": "+254700123456"
  }
}
```

---

## Watchlist

### Get Watchlist
```http
GET /watchlist
Authorization: Bearer <token>
```

### Add to Watchlist
```http
POST /watchlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyId": "uuid",
  "targetPrice": 20.00,
  "note": "Good entry point"
}
```

### Remove from Watchlist
```http
DELETE /watchlist/:companyId
Authorization: Bearer <token>
```

---

## Sectors & Regions

### Get All Sectors
```http
GET /sectors
```

### Get All Regions
```http
GET /regions
```

---

## Error Responses

All endpoints may return error responses:

```json
{
  "error": "Error Type",
  "message": "Human readable error message",
  "details": []
}
```

### Common Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## WebSocket Connection

For real-time updates, connect to:
```
ws://localhost:5000/ws
```

**Authentication:**
```json
{ "type": "authenticate", "userId": "user-uuid" }
```

**Subscribe to company:**
```json
{ "type": "subscribe", "companyId": "company-uuid" }
```



