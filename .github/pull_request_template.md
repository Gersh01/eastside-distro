## What and why

<!-- One or two sentences. Link the roadmap item or feature spec in docs/. -->

## How to verify

<!-- Steps a reviewer can follow, or the tests that cover it. -->

## Checklist

- [ ] `npm run check` passes (lint, typecheck, format, unit tests)
- [ ] New behavior has tests (unit for logic, e2e for user flows)
- [ ] Schema changes have a generated migration that is backward compatible (see `.claude/skills/db-change`)
- [ ] Compliance rules, age checks and authorization run on the server, not only in the UI
- [ ] Docs updated (`docs/roadmap.md`, feature spec, `docs/data-model.md`, ADR if a decision changed)
- [ ] Infra changes: `cd infra && npm test && npm run synth` pass, and `cdk diff` was reviewed
