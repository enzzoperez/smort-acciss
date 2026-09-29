# Termination validation

Agents are overconfident. **“Done” is decided by external checks**, not by how the code looks.

## Before declaring done

Work through the gates **in order**. Stop at the first failure; fix, then continue. Do not skip ahead.

### Gate 1 — Static / syntax

- Run `npm run lint` and/or `npm run check` (see `docs/verification.md`).
- Pass, or fail **only** on documented known baseline.
- No new lint/type errors introduced by this change.

### Gate 2 — Behavior of the change

- Match the active item in `docs/features.md` (or the user’s stated acceptance).
- Completion evidence recorded (command summary and/or smoke note).
- WIP=1 respected: no drive-by refactors while the core change was unverified (`docs/work-rules.md`).

### Gate 3 — System / flow (when the change touches product paths)

Required if login, config hub, camera/scan, offline DB, or API was touched:

- Smoke the affected path on device/emulator, **or**
- Explicitly report: `smoke: not run — <reason>`

No automated E2E suite yet; honesty beats fake green.

## Completion priority

1. Functional correctness (gates above)
2. Then performance
3. Then style-only polish

Do **not** refactor, restyle, or “improve” unrelated code until Gate 1–2 pass for the active task.

## Self-eval ban

Do not claim completion with phrases like “should work”, “looks correct”, or “LGTM” without gate results.  
If you cannot run a gate, say so and leave the task **not done** (or `active` / `blocked` on the feature list).

## Reporting failures (actionable)

When a gate fails, report:

- What command/path failed
- Relevant error excerpt
- Likely fix location (file/area) if known

Not just: “tests failed” / “check failed”.
