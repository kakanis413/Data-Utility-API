# Data-Utility-API
Book Library API — a useful, practical API that lets you manage a personal reading list with books, authors, and reading status. It will have a PostgreSQL database and full CRUD operations plus useful aggregation endpoints like reading stats and books by genre.

## Overview
pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
pnpm workspace monorepo using TypeScript. Contains a Book Library REST API backed by PostgreSQL.

- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
## Book Library API
A personal reading list manager. Tracks books with reading status, ratings, genre, and notes.
### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/healthz | Health check |
| GET | /api/books | List all books (filter by `?status=` or `?genre=`) |
| POST | /api/books | Add a book |
| GET | /api/books/:id | Get a book by ID |
| PATCH | /api/books/:id | Update a book |
| DELETE | /api/books/:id | Delete a book |
| PATCH | /api/books/:id/rating | Rate a book (1-5) |
| GET | /api/stats | Reading statistics (counts, avg rating) |
| GET | /api/stats/genres | Books grouped by genre |
### Book statuses
- `want_to_read` — on the reading list
- `reading` — currently reading
- `finished` — completed
- `abandoned` — gave up on it
## Key Commands
- `pnpm run typecheck` — full typecheck across all packages
