# East Side Distro

Website for East Side Distro (Eastside Distribution Co.), a wholesale and retail distributor of
kava, botanicals and functional beverages in Orlando, Florida.

**Live today (Phase 0):** paginated catalogue of all 32 catalogue products by category, product
pages with state-by-state availability, the wholesale onboarding form, and the contact form.
**Next:** accounts with ID age verification, staff tools, then online ordering for retail and
wholesale. See [docs/roadmap.md](docs/roadmap.md).

## Quick start

Requirements: Node 24, Docker Desktop.

```bash
npm ci
cp .env.example .env.local
npm run db:setup   # Postgres in Docker, migrations, catalog seed
npm run dev        # http://localhost:3000
```

Before pushing: `npm run check` (lint, typecheck, format, unit tests). End-to-end tests:
`npm run e2e`.

## Documentation

| Topic                                | Where                                                        |
| ------------------------------------ | ------------------------------------------------------------ |
| How the system fits together         | [docs/architecture.md](docs/architecture.md)                 |
| Database tables                      | [docs/data-model.md](docs/data-model.md)                     |
| Kratom / kava / hemp rules           | [docs/compliance.md](docs/compliance.md)                     |
| Plan and status                      | [docs/roadmap.md](docs/roadmap.md)                           |
| Feature specs                        | [docs/features/](docs/features/)                             |
| Decisions (ADRs)                     | [docs/decisions/](docs/decisions/)                           |
| Local setup, AWS setup, deploys      | [docs/runbooks/](docs/runbooks/)                             |
| Catalogue questions for the business | [docs/catalog-data-review.md](docs/catalog-data-review.md)   |
| Working with Claude Code             | [CLAUDE.md](CLAUDE.md), `.claude/skills/`, `.claude/agents/` |

## Deployment

GitHub Actions runs CI on every pull request. After CI passes on `main`, the Deploy workflow
deploys **staging** to AWS. **Production** is a manual workflow run with required approval.
First-time AWS and GitHub setup: [docs/runbooks/aws-setup.md](docs/runbooks/aws-setup.md).
