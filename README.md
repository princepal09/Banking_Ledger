# 🏦 Banking Ledger — Backend API

A robust backend REST API for a **banking ledger system** built with **Node.js**, **Express 5**, and **MongoDB**. It implements user authentication with JWT and token blacklisting, multi-account management, peer-to-peer fund transfers with **double-entry ledger bookkeeping**, idempotent transactions with ACID guarantees, and transactional email notifications.

> 🌐 **Live Demo:** [https://banking-ledger-eix1.onrender.com](https://banking-ledger-eix1.onrender.com)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Highlights](#-architecture-highlights)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Server](#running-the-server)
- [API Reference](#-api-reference)
  - [Auth Routes](#auth-routes)
  - [Account Routes](#account-routes)
  - [Transaction Routes](#transaction-routes)
- [Data Models](#-data-models)
- [Authentication Flow](#-authentication-flow)
- [License](#-license)

---

## ✨ Features

- **User Registration & Login** — Secure sign-up and sign-in with hashed passwords (bcrypt, 10 salt rounds).
- **JWT Authentication** — Token-based auth with HTTP-only cookies and Authorization header support.
- **Token Blacklisting** — Secure logout by blacklisting tokens with automatic TTL expiry (3 days) via MongoDB.
- **Multi-Account Support** — Users can create and manage multiple bank accounts with status tracking (`ACTIVE`, `FROZEN`, `CLOSED`).
- **Fund Transfers** — Peer-to-peer money transfers between accounts with full validation (sufficient balance, active accounts).
- **Double-Entry Ledger** — Every transaction creates two immutable ledger entries (DEBIT for sender, CREDIT for receiver), ensuring books always balance.
- **Immutable Ledger** — Ledger entries are append-only; update, delete, and modify operations are blocked at the model level.
- **Derived Balances** — Account balances are computed on-the-fly from ledger entries via MongoDB aggregation, never stored directly.
- **Idempotent Transactions** — Unique `idempotencyKey` per transaction prevents duplicate processing.
- **ACID Transactions** — Fund transfers use MongoDB sessions with `startTransaction()` / `commitTransaction()` for atomicity.
- **System User Privilege** — A two-tier auth system allows designated system users to seed initial funds into accounts.
- **Email Notifications** — Automatic email receipts on registration and successful transfers via Gmail OAuth2 (Nodemailer).

---

## 🛠 Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Runtime        | Node.js (≥ 20)                      |
| Framework      | Express 5                           |
| Database       | MongoDB Atlas (Mongoose 9 ODM)      |
| Authentication | JSON Web Tokens (`jsonwebtoken`)    |
| Password Hash  | bcrypt                              |
| Email          | Nodemailer (Gmail OAuth2)           |
| Config         | dotenv                              |

---

## 🏗 Architecture Highlights

```
┌─────────────────────────────────────────────────────────────┐
│                    Double-Entry Ledger                       │
│                                                             │
│  Every transfer creates exactly TWO ledger entries:         │
│                                                             │
│  ┌──────────────┐        ┌──────────────┐                   │
│  │  DEBIT Entry  │        │ CREDIT Entry │                   │
│  │  (sender)     │        │  (receiver)  │                   │
│  └──────────────┘        └──────────────┘                   │
│                                                             │
│  Balance = Σ CREDIT − Σ DEBIT  (computed, never stored)     │
│  Entries are IMMUTABLE — no updates or deletes allowed      │
│  Transactions are IDEMPOTENT via unique idempotencyKey      │
│  All transfers are ATOMIC via MongoDB sessions              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Banking_Ledger/
├── .gitignore
├── README.md
└── server/
    ├── .env                          # Environment variables (not committed)
    ├── package.json
    └── src/
        ├── index.js                  # App entry — Express setup & server start
        ├── config/
        │   └── database.js           # MongoDB connection via Mongoose
        ├── models/
        │   ├── user.model.js         # User schema (name, email, password, systemUser flag)
        │   ├── account.model.js      # Account schema (user ref, status, currency) + getBalance()
        │   ├── transaction.model.js  # Transaction schema (from/to accounts, idempotencyKey)
        │   ├── ledger.model.js       # Immutable ledger entries (DEBIT/CREDIT, append-only)
        │   └── blackList.model.js    # Blacklisted tokens (auto-expire via TTL index)
        ├── controllers/
        │   ├── user.controller.js    # Register, login, logout
        │   ├── account.controller.js # Create account, get accounts, get balance
        │   └── transaction.controller.js # Create transfer, system initial-funds
        ├── routes/
        │   ├── auth.routes.js        # POST /register, /login, /logout
        │   ├── account.routes.js     # POST /create, GET /getUserAccounts, GET /getAccountBalance/:id
        │   └── transaction.routes.js # POST /create, POST /system/initial-funds
        ├── middleware/
        │   └── auth.middleware.js     # JWT verification (standard + system-user middleware)
        └── services/
            └── email.service.js      # Gmail OAuth2 transporter — registration & transaction emails
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** (bundled with Node.js)
- **MongoDB** — A running MongoDB instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (required for session/transaction support)

### Installation

```bash
# Clone the repository
git clone https://github.com/princepal09/Backend_Ledger.git
cd Backend_Ledger/server

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file inside the `server/` directory:

```env
MONGODB_URL = your_mongodb_connection_string
PORT = 3000

JWT_SECRET = your_jwt_secret

# Gmail OAuth2 credentials (for email notifications)
CLIENT_ID = your_google_client_id
CLIENT_SECRET = your_google_client_secret
REFRESH_TOKEN = your_google_refresh_token
EMAIL_USER = your_email@gmail.com
```

> **Note:** To obtain Google OAuth2 credentials for Nodemailer, follow the [Google OAuth2 guide](https://developers.google.com/identity/protocols/oauth2). You'll need to create credentials in the Google Cloud Console and generate a refresh token.

### Running the Server

```bash
# Development (with auto-restart on file changes)
npm run dev

# Production
npm start
```

The server starts at `http://localhost:3000` (or your configured `PORT`).

**Health check:**
```
GET /  →  { "status": "true", "message": "Your server is up and running successfully" }
```

---

## 📖 API Reference

**Base URL:** `/api/v1`
**Live URL:** `https://banking-ledger-eix1.onrender.com/api/v1`

All protected routes require a valid JWT token sent as either:
- An HTTP-only cookie named `authCookie`, **or**
- An `Authorization: Bearer <token>` header

---

### Auth Routes

| Method | Endpoint              | Auth | Description                                      |
| ------ | --------------------- | ---- | ------------------------------------------------ |
| POST   | `/api/v1/auth/register` | ❌   | Register a new user                              |
| POST   | `/api/v1/auth/login`    | ❌   | Login and receive a JWT token                    |
| POST   | `/api/v1/auth/logout`   | ✅   | Logout (blacklists token, clears cookie)         |

#### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOi..."
}
```
> A welcome email is sent asynchronously upon registration.

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):** Sets `authCookie` as an HTTP-only cookie (expires in 3 days) and returns the token + user info.

#### Logout

```http
POST /api/v1/auth/logout
Cookie: authCookie=<token>
```

> The token is added to the blacklist and the cookie is cleared.

---

### Account Routes

| Method | Endpoint                                     | Auth | Description                              |
| ------ | -------------------------------------------- | ---- | ---------------------------------------- |
| POST   | `/api/v1/account/create`                     | ✅   | Create a new bank account                |
| GET    | `/api/v1/account/getUserAccounts`             | ✅   | Get all accounts for the logged-in user  |
| GET    | `/api/v1/account/getAccountBalance/:accountId`| ✅   | Get the derived balance of an account    |

#### Create Account

```http
POST /api/v1/account/create
Content-Type: application/json
Cookie: authCookie=<token>
```

**Response (201):**
```json
{
  "success": true,
  "account": {
    "_id": "...",
    "user": "...",
    "status": "ACTIVE",
    "currency": "INR"
  }
}
```

> New accounts default to `ACTIVE` status and `INR` currency.

#### Get Account Balance

```http
GET /api/v1/account/getAccountBalance/6650abc123def456
Cookie: authCookie=<token>
```

> Balance is **derived on-the-fly** from ledger entries (Σ CREDIT − Σ DEBIT). Ownership is verified — you can only query balances for your own accounts.

---

### Transaction Routes

| Method | Endpoint                                    | Auth         | Description                         |
| ------ | ------------------------------------------- | ------------ | ----------------------------------- |
| POST   | `/api/v1/transaction/create`                | ✅ (user)     | Transfer funds between accounts     |
| POST   | `/api/v1/transaction/system/initial-funds`  | ✅ (system)   | Seed initial funds (system users only) |

#### Transfer Funds

```http
POST /api/v1/transaction/create
Content-Type: application/json
Cookie: authCookie=<token>

{
  "fromAccount": "6650abc123def456",
  "toAccount": "6650xyz789ghi012",
  "amount": 500,
  "idempotencyKey": "unique-uuid-v4-here"
}
```

**Validations performed:**
- Both accounts must exist and be `ACTIVE`
- Sender account must have sufficient balance
- `idempotencyKey` must be unique (duplicate requests return the existing result)

**On success:**
1. A `Transaction` record is created (status: `PENDING` → `COMPLETED`)
2. Two immutable `Ledger` entries are created atomically:
   - **DEBIT** on sender account
   - **CREDIT** on receiver account
3. An email receipt is sent to the sender

**Idempotency behavior:**

| Existing Status | Response                          |
| --------------- | --------------------------------- |
| `COMPLETED`     | Returns the existing transaction  |
| `PENDING`       | Returns "still in Processing"     |
| `FAILED`        | Returns error                     |
| `REVERSED`      | Returns "please retry"            |

#### Seed Initial Funds (System User Only)

```http
POST /api/v1/transaction/system/initial-funds
Content-Type: application/json
Authorization: Bearer <system-user-token>

{
  "toAccount": "6650abc123def456",
  "amount": 10000,
  "idempotencyKey": "unique-uuid-v4-here"
}
```

> This endpoint is restricted to users with `systemUser: true`. It allows seeding funds into any account from the system user's own account.

---

## 📊 Data Models

### User

| Field      | Type    | Details                                              |
| ---------- | ------- | ---------------------------------------------------- |
| name       | String  | Required                                             |
| email      | String  | Required, unique, lowercase, trimmed, regex-validated |
| password   | String  | Required, min 6 chars, excluded from queries by default |
| systemUser | Boolean | Default: `false`, hidden from queries by default     |
| createdAt  | Date    | Auto-generated                                       |
| updatedAt  | Date    | Auto-generated                                       |

> Password is auto-hashed via a pre-save hook (bcrypt, 10 rounds).

### Account

| Field     | Type     | Details                                        |
| --------- | -------- | ---------------------------------------------- |
| user      | ObjectId | Ref → `User`, required, indexed                |
| status    | String   | Enum: `ACTIVE`, `FROZEN`, `CLOSED` — Default: `ACTIVE` |
| currency  | String   | Required — Default: `INR`                      |
| createdAt | Date     | Auto-generated                                 |
| updatedAt | Date     | Auto-generated                                 |

> **Compound Index:** `{ user: 1, status: 1 }`
> **`getBalance()`** instance method computes balance from ledger via aggregation.

### Transaction

| Field          | Type     | Details                                                     |
| -------------- | -------- | ----------------------------------------------------------- |
| fromAccount    | ObjectId | Ref → `Account`, required, indexed                          |
| toAccount      | ObjectId | Ref → `Account`, required                                   |
| amount         | Number   | Required, min: 0                                            |
| status         | String   | Enum: `PENDING`, `COMPLETED`, `FAILED`, `REVERSED` — Default: `PENDING` |
| idempotencyKey | String   | Required, unique, indexed                                   |
| createdAt      | Date     | Auto-generated                                              |
| updatedAt      | Date     | Auto-generated                                              |

### Ledger (Immutable, Append-Only)

| Field       | Type     | Details                                      |
| ----------- | -------- | -------------------------------------------- |
| account     | ObjectId | Ref → `Account`, required, indexed, **immutable** |
| transaction | ObjectId | Ref → `Transaction`, required, indexed, **immutable** |
| type        | String   | Enum: `CREDIT`, `DEBIT` — required, **immutable** |
| amount      | Number   | Required, **immutable**                      |

> ⚠️ All fields are immutable. Pre-hooks block `update`, `delete`, and `remove` operations — entries can only be created, never modified.

### BlacklistedToken

| Field     | Type   | Details                                                   |
| --------- | ------ | --------------------------------------------------------- |
| token     | String | Required, unique                                          |
| createdAt | Date   | Auto-generated, TTL index (auto-deletes after **3 days**) |

---

## 🔐 Authentication Flow

```
┌────────────┐                              ┌─────────────────┐
│   Client   │                              │     Server      │
│            │  POST /auth/register          │                 │
│            │ ──────────────────────────►   │ Creates user    │
│            │  ◄─── 201 + Set-Cookie:      │ Hashes password │
│            │       authCookie (3 days)     │ Signs JWT (2h)  │
│            │                              │ Sends welcome   │
│            │  POST /auth/login             │   email         │
│            │ ──────────────────────────►   │                 │
│            │  ◄─── 200 + Set-Cookie:      │ Validates creds │
│            │       authCookie (3 days)     │ Signs JWT (2h)  │
│            │                              │                 │
│            │  Protected Request            │                 │
│            │  Cookie: authCookie=<jwt>     │                 │
│            │ ──────────────────────────►   │ Checks blacklist│
│            │                              │ Verifies JWT    │
│            │                              │ Attaches user   │
│            │  ◄─── Response               │   to req.user   │
│            │                              │                 │
│            │  POST /auth/logout            │                 │
│            │ ──────────────────────────►   │ Blacklists token│
│            │  ◄─── Cookie cleared          │ Clears cookie   │
└────────────┘                              └─────────────────┘
```

**Key details:**
- **JWT Expiry:** 2 hours
- **Cookie Expiry:** 3 days
- **Blacklist TTL:** 3 days (auto-deleted by MongoDB)
- **Two-tier middleware:** `auth` for regular users, `authSystemUserMiddleware` for system-level operations

---

## 📄 License

This project is licensed under the **ISC License**.
