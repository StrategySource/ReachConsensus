# Reach Consensus Web App

Reach Consensus is a Next.js app for building Cisco proposal workspaces and publishing immutable customer microsites. The current app runs against fixture-backed repository data in `src/lib/reach-consensus`.

## Setup

Install dependencies from `apps/web`:

```bash
PATH=/private/tmp/codex-node/bin:/private/tmp/codex-npm-bin:$PATH /private/tmp/codex-node/bin/npm install
```

Start the local app:

```bash
PATH=/private/tmp/codex-node/bin:/private/tmp/codex-npm-bin:$PATH /private/tmp/codex-node/bin/npm run dev
```

Open `http://localhost:3000`.

## Route Map

- `/` - Reach Consensus entry page.
- `/dashboard` - internal proposal list with workspace, guided setup, and customer microsite links.
- `/proposals/[proposalId]` - internal proposal workspace with overview, feedback, and activity.
- `/proposals/[proposalId]/setup` - guided setup checklist for customer-facing sections and invited parties.
- `/p/[slug]` - customer microsite rendered from the latest published snapshot only.

## Test And Build

Run app tests:

```bash
PATH=/private/tmp/codex-node/bin:/private/tmp/codex-npm-bin:$PATH /private/tmp/codex-node/bin/npm run test
```

Build the Next.js app:

```bash
PATH=/private/tmp/codex-node/bin:/private/tmp/codex-npm-bin:$PATH /private/tmp/codex-node/bin/npm run build
```

## Supabase Validation Note

The Supabase migration lives outside the app surface in `../../supabase/migrations`. App tests and the Next.js build do not validate that SQL migration. Validate the migration separately with the Supabase CLI or `psql` against a local database when those tools and a reachable local Supabase/Postgres environment are available.
