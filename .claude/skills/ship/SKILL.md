---
name: ship
description: Prepare finished work for review and deployment - run every check, update docs, write the commit and pull request, and explain how it reaches staging and production.
disable-model-invocation: true
---

# Ship a change

1. `git status` and `git diff`: make sure only intended files changed (no `.env*`, no stray
   build output).
2. Run `npm run check` and `npm run build`. Run `npm run e2e` when user flows changed
   (needs `npm run db:setup`). For `infra/` changes: `npm --prefix infra test`,
   `npm --prefix infra run synth`, and review `npm --prefix infra run diff` if AWS
   credentials are available.
3. Docs: roadmap item ticked, feature spec status, data model, ADR if a decision was made.
4. Ask the user before committing or pushing. Commit on a branch, not `main`, with a message
   that says why. Open a PR using `.github/pull_request_template.md`.
5. Explain what happens next: CI runs on the PR; after merge to `main`, CI passes and the
   **Deploy** workflow ships to staging automatically. Production is a manual
   "Run workflow → production" that waits for an approver.
