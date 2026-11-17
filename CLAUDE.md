# Bomberman-2.0 (frontend)

Client of a multiplayer Bomberman game. The server is authoritative for game state. The client mirrors state and renders.

Stack: React 19, Phaser 4, TypeScript, Vite, Tailwind, Biome.

## npm scripts

| Script | Action |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run start` | Preview the production build on :3000 |
| `npm run check` | `biome ci .`: lint and format check on the whole repo, no writes |
| `npm run typecheck` | `tsc --noEmit` (vite build does not type-check) |
| `npm run lint:fix` / `npm run format:fix` | Biome lint / format with fixes on the whole repo |
| `npm run format` | Biome format check |

## Imports

Import from `src` with the `@/` alias (`@/components/ui/button`, `@/utils/types`), never with a relative path. `@/` maps to `src/` (`tsconfig.json` `paths`; Vite reads it through `resolve.tsconfigPaths`). Biome `noRestrictedImports` fails on a relative import. The only exception is the map JSON from `public/assets/maps/` in `src/routes/map/SelectMap.tsx`, which is outside `src`.

## Checks before a commit

Never commit with a failing check. Each command must exit 0. `<changed files>` means only the files you changed yourself.

1. Fix Biome in your files: `npx biome check --write <changed files>`.
2. Lint and format: `npm run check`
3. Types: `npm run typecheck`
4. Build: `npm run build`

CI runs the same `checks` job on every PR to `dev`. A red check blocks the merge.

There is no unit-test script. The `test` script is a load test (`workLoadTest.js`), not a unit test.

End-to-end tests live in `NickDurnev/Bomberman-2.0-E2E`. They use the read-only test hook in `src/utils/e2e.ts`, which exists only in builds with `VITE_E2E=true` (workspace `docs/e2e-hook.md`). A change to the hook or to a `clientSocket.on` / `.off` needs a companion E2E PR.

## Workflow

- Open PRs to `dev`.
- Use Conventional Commits. Do not add AI attribution. See `.claude/rules/`.

## Workspace

Architecture docs, shared rules, skills and agents live in the workspace repo `NickDurnev/Bomberman-2.0-Workspace`. When this repo is checked out as its submodule, read `../CLAUDE.md` and `../docs/README.md` first. In a standalone clone, the docs are at https://github.com/NickDurnev/Bomberman-2.0-Workspace.

`.claude/skills/pr-review` and `.claude/agents/game-contract-reviewer.md` are copies of the workspace versions for cloud routines; edit them in the workspace repo first, then copy.
