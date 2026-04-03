# Finance Dashboard API

Production-ready backend API for finance tracking with authentication, role-based access control, transaction management, summary analytics, Prisma ORM, and Neon PostgreSQL.

## Live Links

- Production API Base URL: https://inance-dashboard-api.onrender.com/
- Swagger Docs: https://inance-dashboard-api.onrender.com/api-docs/#/

## What This Project Provides

- JWT authentication (access + refresh flow)
- Role-based authorization (`VIEWER`, `ANALYST`, `ADMIN`)
- Transaction CRUD
- Transaction import and CSV export
- Summary analytics endpoints (overview, category, monthly, recent)
- Prisma + PostgreSQL (Neon) data layer
- Global error handling and validation
- Swagger/OpenAPI documentation

## Tech Stack

- Runtime: Node.js + TypeScript
- Framework: Express
- ORM: Prisma
- Database: Neon PostgreSQL
- Auth: `jsonwebtoken`, `bcryptjs`
- Validation: `zod`
- Documentation: `swagger-jsdoc`, `swagger-ui-express`

## API Base Path

All API endpoints are served under:

- `/api/v1`

Examples:

- `POST /api/v1/auth/register`
- `GET /api/v1/transactions`
- `GET /api/v1/summary/overview`

## Authentication and Roles

### Auth Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Roles

- `VIEWER`: limited access (read-focused)
- `ANALYST`: can create/update transactions and access analytics
- `ADMIN`: full access including user management

## Main API Endpoints

### Transactions

- `POST /api/v1/transactions` - Create transaction
- `GET /api/v1/transactions` - List transactions (filter/search/sort/paginate)
- `GET /api/v1/transactions/{id}` - Get transaction by ID
- `PUT /api/v1/transactions/{id}` - Full update
- `PATCH /api/v1/transactions/{id}` - Partial update
- `DELETE /api/v1/transactions/{id}` - Soft delete
- `GET /api/v1/transactions/export` - Export CSV
- `POST /api/v1/transactions/import` - Bulk import

### Summary

- `GET /api/v1/summary/overview`
- `GET /api/v1/summary/category`
- `GET /api/v1/summary/monthly`
- `GET /api/v1/summary/recent`

### Users (Admin)

- `GET /api/v1/users`
- `PATCH /api/v1/users/{id}`
- `DELETE /api/v1/users/{id}`

## Environment Variables

Use a `.env` file with values similar to this:

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

- On Render, platform `PORT` is provided automatically.
- Keep secrets private and rotate immediately if exposed.

## Local Development

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Build and Run

```bash
npm run build
npm start
```

## Database and Seed Data

Seed script creates/updates baseline users:

- `admin@finance.com` (ADMIN)
- `analyst@finance.com` (ANALYST)

And inserts sample transactions across categories:

- Salary, Freelance, Investment
- Food, Transport, Entertainment, Utilities, Rent, Healthcare, Shopping, Education

Run seed manually:

```bash
npm run db:seed
```

## Swagger Usage

1. Open: https://inance-dashboard-api.onrender.com/api-docs/#/
2. Click **Authorize**
3. Paste `Bearer <your-access-token>`
4. Test endpoints directly from UI

Swagger includes:

- Request body schemas
- Query/path parameter docs
- Success and error response schemas

## Deployment (Render)

### Recommended Build Command

```bash
npm install && npm run build
```

### Start Command

```bash
npm start
```

### Post-deploy checks

- `GET /health`
- `POST /api/v1/auth/login`
- `GET /api/v1/summary/overview` with Bearer token

## Troubleshooting

### Swagger shows no APIs

- Ensure latest deployment is live
- Confirm `src/config/swagger.ts` defines OpenAPI paths

### Prisma type errors in editor

- Run `npx prisma generate`
- Restart TS server in VS Code

### Unauthorized errors

- Ensure `Authorization: Bearer <access-token>` header is present
- Check token expiry and refresh flow

## License

ISC
