# Copilot Coding Agent — Repository Instructions (DocketChief)

Purpose
- Onboard and instruct the Copilot coding agent for working in this repository.
- Provide repository-specific rules, build/test commands, and safety boundaries so the agent can make safe, reviewable changes.

Repository overview
- Type: Frontend SPA using Vite + React + TypeScript + Tailwind.
- Key directories:
  - `src/` — application source (components, pages, hooks, contexts, lib)
  - `public/` — static assets
  - `supabase/` — serverless functions and infra-related code

Quick facts (from repository)
- Package manager: npm (>=10)
- Node engine: >=20 <21
- Main scripts (from `package.json`):
  - `dev`: vite (local dev server)
  - `build`: vite build (production build)
  - `build:dev`: vite build --mode development
  - `lint`: eslint .
  - `preview`: vite preview

Agent contract (inputs/outputs)
- Inputs: a clear issue or task, the files changed in working tree, and tests/lints to run.
- Outputs: a focused change (PR) with a short description, the edited files, and evidence the change passes local lint/build (and tests if any).
- Error modes: syntax/type errors, failing lint, or failing build. When encountered, create a minimal fix and include failing output in the PR description.

What the agent is allowed to do
- Make small to moderate code changes (bug fixes, refactors, new small components, tests, docs) within `src/` and `supabase/functions`.
- Add tests and small tooling files needed to validate changes (e.g., unit test files, minor config tweaks) if they are low-risk.
- Run local commands to validate changes (see "Validation steps").

What the agent must NOT do (safety boundaries)
- Do NOT modify credentials, secrets, or any `.env` files. If secret changes are required, leave instructions and raise to a human.
- Do NOT change CI/CD, deployment manifests, or production infra without explicit human approval (files like `netlify.toml`, `vercel.json`, or infra in `supabase/` unless the task explicitly asks and a human confirms).
- Avoid large-scale UI redesigns, authentication changes, or billing/payment changes without a human in the loop.
- Avoid high-risk changes touching payment provider code (`DocketChiefPayment`, `GoDaddyPayment`, Stripe integration docs) unless the task is specifically about them and a human reviewer is present.

Coding conventions & expectations
- Match existing TypeScript types and React patterns. Prefer functional components.
- Follow ESLint rules — run `npm run lint` and fix reported issues.
- Keep changes small and contained to a single concern per PR.
- Add or update Story-like examples or small tests when adding components or logic.

Validation steps (what the agent should run locally)
1. Lint: `npm run lint` — ensure zero lint errors.
2. Build: `npm run build` — ensure the build completes without errors.
3. Preview build (optional): `npm run preview` for manual smoke checks.

What to include in a PR
- Short summary of the change and why.
- List of files changed (what to review), and any manual verification steps.
- Outputs from `npm run lint` and `npm run build` (successful or failing) included in the PR description or as a comment.
- If tests were added, include the test run output.

Tests & CI
- This repo doesn't include a test script in `package.json`. If you add tests, also add a script `test` and include a brief test run in the PR.

When to escalate / ask for human review
- Any change that touches payment, billing, or external provider integrations.
- Any change that requires secret rotation, credential updates, or access tokens.
- Major architectural changes, migrations, or changes to CI/CD.
- When build or lint fails and the root cause cannot be fixed with a safe, small change.

Notes for the agent
- Keep PRs focused and small.
- Run the Validation steps before opening any PR.
- When unsure about scope or risk, propose the change in an issue or ask for a human in the PR description.

Housekeeping
- File to edit for these rules: `.github/COPILOT_AGENT.md`.
- If project conventions change, update this file with the new scripts and guidance.

Next steps for maintainers
- Confirm a reviewer/approver contact in this file (email or GitHub handle) if you want stricter escalation routes.
- Optionally add a `test` script and CI checks for lint/build/test enforcement.

---
Generated: Copilot agent onboarding for this repository. Update as project evolves.
