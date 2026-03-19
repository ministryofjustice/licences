# Copilot Instructions

## What This Application Does

This is the **HMPPS HDC (Home Detention Curfew) Licences** service — a UK Ministry of Justice web application managing the lifecycle of prison release licences. It supports multiple user roles (CA = Community Area/Prison staff, RO = Responsible Officer/Probation, DM = Decision Maker) through a multi-stage workflow, integrating with NOMIS (prison management), Delius (probation), HDC API, and Probation Teams API. Licences are generated as PDFs via Gotenberg.

## Tech Stack

- **Runtime**: Node.js v24, Express 5
- **Language**: TypeScript (with some legacy JavaScript files)
- **Templating**: Pug
- **Database**: PostgreSQL (Knex query builder + knex-migrate for migrations)
- **Cache/Sessions**: Redis (connect-redis)
- **Auth**: OAuth2 via Passport against HMPPS Auth server
- **Testing**: Jest + ts-jest, Supertest, Nock
- **PDF**: Gotenberg service

## Commands

```bash
npm run build          # Compile TypeScript, Sass, copy views → dist/
npm run start:dev      # Watch mode (rebuilds TS/Sass/views on change)
npm run lint           # ESLint
npm run typecheck      # TypeScript type checking only
npm run test           # Unit tests (test/**/*.test.{ts,js})
npm run test:ci        # Unit tests, single-threaded (for CI)
npm run integration-test  # Integration tests (integration_test/**/)

# Run a single test file
npx jest test/services/licenceService.test.ts

# Run tests matching a name pattern
npx jest test/services/licenceService.test.ts -t "getRiskVersion"

# Database migrations
npm run db:knex-migrate up       # Apply pending migrations
npm run db:knex-migrate pending  # List pending
npm run db:knex-migrate down     # Rollback last batch
npm run db:seed                  # Populate seed data
```

## Architecture

### Request Flow

```
OAuth2 login (HMPPS Auth) → Passport → token verification
  → Express routes → asyncMiddleware → Services → Data clients
    → PostgreSQL (via Knex) / Redis / external APIs
```

### Key Layers

- **`server/app.js`** — Express app factory: middleware, sessions, security, Pug config
- **`server/index.js`** — Dependency injection root: instantiates all services and wires them into route factories
- **`server/routes/`** — Express routers (one file per feature area). No controllers; routes call services directly.
- **`server/services/`** — All business logic. Services are instantiated in `index.js` and injected.
- **`server/data/`** — Data access layer: DB clients, API clients (NOMIS, Delius, HDC API, etc.), Redis client
- **`server/data/dataAccess/`** — Raw PostgreSQL connection pool and transaction helper
- **`server/authentication/`** — OAuth2 strategy, token verification, sign-in service
- **`server/views/`** — Pug templates organised by feature
- **`server/utils/`** — Shared middleware helpers, form validation, PDF formatting

### Route Factory Pattern

Routes are exported as factory functions that accept services and return a router setup function:

```typescript
module.exports = ({ licenceService, conditionsService }) => (router, auditor) => {
  router.get('/:bookingId', asyncMiddleware(async (req, res) => {
    const licence = await licenceService.getLicence(req.params.bookingId)
    return res.render('conditions/index', { licence })
  }))
  return router
}
```

### Service Pattern

```typescript
export class LicenceService {
  constructor(private readonly licenceClient: LicenceClient) {}
  async getLicence(bookingId: string) { ... }
}

export function createLicenceService(licenceClient: LicenceClient) {
  return new LicenceService(licenceClient)
}
```

Always export both the class and a named factory function (`createXxxService`).

## Database Conventions

- Schema managed via **42 Knex migrations** in `migrations/` (timestamped filenames).
- Primary table: `licences` — stores licence data as JSONB, plus `booking_id`, `stage`, `version`, `vary_version`, `deleted_at`.
- Soft deletes: recent migrations added `deleted_at`; use views `v_licences_excluding_deleted` and `v_licence_versions_excluding_deleted` rather than querying tables directly when excluding deleted records.
- Transactions via `inTransaction(callback)` from `server/data/dataAccess/`.

## Testing Conventions

**Unit tests** live in `test/` mirroring `server/` structure. Inject mock services via `jest.fn()`:

```typescript
beforeEach(() => {
  licenceClient = { getLicence: jest.fn().mockResolvedValue({ ... }) }
  service = createLicenceService(licenceClient)
})
```

**Integration tests** in `integration_test/` use Supertest against a full Express app with mocked services:

```typescript
import { appSetup } from '../../test/supertestSetup'
const app = createApp('caUser')  // role-specific app instance
request(app).get('/hdc/forms/eligible/1').expect(200)
```

Run integration tests with Docker services up (`docker-compose up` for DB, Redis, Gotenberg, Auth).

## Local Development

```bash
docker-compose up            # Start PostgreSQL, Redis, Gotenberg, HMPPS Auth, token-verification
npm run db:knex-migrate up   # Apply migrations
npm run db:seed              # Load test users
npm run start:dev            # Start app in watch mode
```

Alternatively:
```bash
docker-compose -f docker-compose-minimal.yml up  # DB + Redis only
npm run start-mocks                               # Start mock services for external APIs
```

Key env vars (see `server/config.js` for full list with defaults):

| Variable | Purpose |
|---|---|
| `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASS` | PostgreSQL connection |
| `REDIS_HOST`, `REDIS_PORT` | Redis |
| `NOMIS_AUTH_URL`, `API_CLIENT_ID`, `API_CLIENT_SECRET` | HMPPS Auth / OAuth2 |
| `SESSION_SECRET` | Express session signing |
| `ENABLE_TEST_UTILS` | Enables test helper routes (dev only) |
| `PUSH_TO_NOMIS` | Whether to write back to NOMIS on approval |

## Authentication & Roles

- OAuth2 login via Passport against `NOMIS_AUTH_URL`. Tokens stored in Redis-backed session.
- Token validity verified on each request via token-verification-api.
- Role checks via `authorisationMiddleware` on each router; RO users use client-credentials tokens (admin permissions) rather than their user token.
- Roles in use: `CA` (prison), `RO` (probation), `DM` (decision maker), `BATCHLOAD`, `ADMIN`.

## Key Conventions

- **`asyncMiddleware()`** wraps all async route handlers — always use it to propagate errors to Express.
- **Ramda** is used extensively for functional data transformations in services.
- **Moment + moment-business-days** for all date calculations (not native `Date`).
- Mixed TypeScript/JavaScript: newer code is `.ts`, legacy files are `.js`. New files should be `.ts`.
- ESLint config in `eslint.config.mjs`; Prettier config in `.prettierrc`.
- The compiled output goes to `dist/` — never edit files there directly.
