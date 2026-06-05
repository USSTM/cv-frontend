# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the frontend codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root.
- **`docs/adr/`** for ADRs that touch the area you're about to work in.
- **Backend domain/API context** when frontend behavior depends on server contracts. The backend repo is expected at `../backend` from this checkout; read `../backend/CONTEXT.md` and relevant `../backend/docs/adr/` files when present.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context frontend repo:

```text
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-example-decision.md
│   └── 0002-example-decision.md
└── src/
```

Related backend context:

```text
../backend/
├── CONTEXT.md
└── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept in an issue title, refactor proposal, hypothesis, or test name, use the term as defined in `CONTEXT.md`. If the UI concept is backed by an API/server concept, prefer the backend term unless the frontend context defines a deliberate UI-specific term.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use, or there's a real gap to resolve with `/grill-with-docs`.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding it.
