# Finance Dashboard API

Production-ready finance backend built with Node.js, Express, TypeScript, Prisma, and Neon PostgreSQL.

This README is organized around your evaluation template and maps each core requirement to the current implementation.

## Live Links

- Production API URL: https://inance-dashboard-api.onrender.com/
- Swagger Docs URL: https://inance-dashboard-api.onrender.com/api-docs/#/

## Project Summary

This backend provides:

- JWT-based auth (`register`, `login`, `refresh`, `logout`, `me`)
- Role-based access control (`VIEWER`, `ANALYST`, `ADMIN`)
- Financial record CRUD with filter/search/pagination
- Summary/analytics APIs for dashboard cards and trends
- Validation and structured error handling
- Persistent data using Neon PostgreSQL via Prisma
- Swagger API documentation with success and error response schemas

## Tech Stack

- Runtime: Node.js
- Language: TypeScript
- Framework: Express
- ORM: Prisma
- Database: Neon PostgreSQL
- Validation: Zod
- Auth: JSON Web Token + bcrypt
- API Docs: swagger-jsdoc + swagger-ui-express

## Core Requirements Mapping

### 1) User and Role Management

Implemented.

- User creation is supported through registration.
- User management endpoints are available to admin users.
- Roles are persisted in database enum (`VIEWER`, `ANALYST`, `ADMIN`).
- User status supports `isActive` and soft-deletion (`deletedAt`).
- Role restrictions are enforced via RBAC middleware.

Role model in this project:

- `VIEWER`: view-only behavior
- `ANALYST`: can access insights and perform record operations needed for analysis
- `ADMIN`: full management over records and users

### 2) Financial Records Management

Implemented.

Record model (`Transaction`) includes:

- `amount`
- `type` (`INCOME` or `EXPENSE`)
- `category`
- `date`
- `description` (notes)

Supported operations:

- Create
- Read (list + single item)
- Update (PUT/PATCH)
- Soft delete
- Filter by type/category/date range
- Search by category/description
- Sort and paginate

### 3) Dashboard Summary APIs

Implemented.

Available summary endpoints:

- `GET /api/v1/summary/overview`
- `GET /api/v1/summary/category`
- `GET /api/v1/summary/monthly`
- `GET /api/v1/summary/recent`

Summary values include:

- Total income
- Total expenses
- Net balance
- Category-wise totals
- Recent activity
- Monthly trend data

### 4) Access Control Logic

Implemented.

Access control is handled at backend level using auth + RBAC middleware.

High-level behavior:

- Viewer cannot perform admin-only actions
- Analyst can access analytics and transaction operations
- Admin can manage users and protected operations

### 5) Validation and Error Handling

Implemented.

- Request validation uses Zod schemas.
- Centralized error middleware handles operational and unexpected errors.
- Error status codes are applied appropriately (`400`, `401`, `403`, `404`, `500`, etc.).
- Invalid operations (unauthorized access, invalid payloads, missing resources) return useful error responses.

### 6) Data Persistence

Implemented with relational DB.

- Database: Neon PostgreSQL
- ORM: Prisma
- Schema contains enums and relational models for users and transactions

No mock DB is used in current implementation.

## Optional Enhancements Included

- Token authentication (JWT access + refresh)
- Pagination in transaction list API
- Search support
- Soft delete (`deletedAt`)
- Rate limiting middleware
- Swagger API docs
- Seed script with realistic sample data across categories

## API Overview

Base path: `/api/v1`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Transactions

- `POST /transactions`
- `GET /transactions`
- `GET /transactions/{id}`
- `PUT /transactions/{id}`
- `PATCH /transactions/{id}`
- `DELETE /transactions/{id}`
- `GET /transactions/export`
- `POST /transactions/import`

### Summary

- `GET /summary/overview`
- `GET /summary/category`
- `GET /summary/monthly`
- `GET /summary/recent`

### Users (Admin)

- `GET /users`
- `PATCH /users/{id}`
- `DELETE /users/{id}`

## Role Access Matrix (Current Behavior)

- Viewer:
	- Can authenticate and view allowed dashboard/record data
	- Cannot perform admin-only management actions
- Analyst:
	- Can access summary insights
	- Can create/update transaction records
- Admin:
	- Full access including user management

## Data Model (Prisma)

### User

- id, email, password, name
- role (`VIEWER`/`ANALYST`/`ADMIN`)
- isActive, refreshToken
- createdAt, updatedAt, deletedAt

### Transaction

- id, amount, type (`INCOME`/`EXPENSE`), category
- description, date, userId
- createdAt, updatedAt, deletedAt

## Environment Variables

Use a `.env` similar to:

```env
NODE_ENV=production
APP_NAME=FinanceDashboardAPI
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
JWT_SECRET=<long-random-secret>
JWT_REFRESH_SECRET=<long-random-refresh-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

Notes:

- Render usually provides `PORT` automatically.
- Keep secrets private and rotate if ever exposed.

## Setup and Run

### Local Development

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

### Build and Start

```bash
npm run build
npm start
```

## Seed Data

Seed script currently:

- upserts users:
	- `admin@finance.com` (`ADMIN`)
	- `analyst@finance.com` (`ANALYST`)
- inserts sample transactions across categories:
	- Salary, Freelance, Investment
	- Food, Transport, Entertainment, Utilities, Rent, Healthcare, Shopping, Education

Run manually:

```bash
npm run db:seed
```

## Swagger Documentation

Swagger URL: https://inance-dashboard-api.onrender.com/api-docs/#/

Swagger includes:

- endpoint-level request body schemas
- query and path parameters
- success response docs
- reusable error schemas and response components

How to test secured endpoints:

1. Login and copy access token.
2. Open Swagger and click `Authorize`.
3. Enter `Bearer <access-token>`.
4. Execute protected APIs.

## Deployment (Render)

Recommended commands:

- Build: `npm install && npm run build`
- Start: `npm start`

Basic health checks after deploy:

- `GET /health`
- `POST /api/v1/auth/login`
- `GET /api/v1/summary/overview` with bearer token

## Evaluation Criteria Mapping

### 1) Backend Design

- Layered structure with clear route/controller/service separation
- Dedicated middleware for auth, RBAC, validation, errors, logging, and rate limiting

### 2) Logical Thinking

- Business rules enforced through role checks and ownership checks
- Dashboard data uses aggregate/grouping logic, not only CRUD

### 3) Functionality

- Core auth, records, summary, and user-management flows implemented

### 4) Code Quality

- TypeScript strict mode
- Consistent naming and modular organization

### 5) Database and Data Modeling

- Prisma schema with enums and relational mapping
- Soft-delete strategy via `deletedAt`

### 6) Validation and Reliability

- Zod validation + central error handling + meaningful status codes

### 7) Documentation

- README setup, architecture, endpoint list, env, assumptions
- Live Swagger with request/response details

### 8) Additional Thoughtfulness

- CSV export/import
- seed strategy for quick demo
- production deployment and troubleshooting notes

## Assumptions and Tradeoffs

- Soft delete is used for data safety instead of hard delete.
- Role permissions are intentionally simple and middleware-driven for clarity.
- Seed data is demo-focused and idempotent for repeatable setup.


