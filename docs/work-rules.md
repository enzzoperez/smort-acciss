# Work rules (WIP=1)

Agents tend to start many things and finish none. This harness forces **one active unit of work** at a time.

## WIP=1

- Only **one** task may be `active` at a time (user request, `PROGRESS.md` In Progress, or a feature list item when `docs/features.md` exists).
- Finish that task (with completion evidence) before starting another.
- Do **not** “also refactor”, “also clean up”, or “also fix baseline debt” while implementing the active task — unless the user explicitly asked.

## Completion evidence

“Done” is not “the code looks fine.” Evidence must be **executable or explicitly reported**:

| Change type                                           | Minimum evidence                                                                               |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Any code change                                       | `npm run check` run + result reported (baseline-only failures OK — see `docs/verification.md`) |
| Login / config hub / camera / scan / offline DB / API | Smoke note: done on device/emulator, or **not run + why**                                      |
| Docs / harness-only                                   | `check` optional if no TS/JS touched; still no drive-by code edits                             |

If evidence is missing, the task stays **in progress** — do not declare victory.

## Scope

- Prefer the smallest change that satisfies the request.
- If the request is broad (“improve scanning”), ask to split into atomic units before coding, or propose a WIP=1 sequence and wait for confirmation.
- Track long work in `PROGRESS.md` (one In Progress item).
- Multi-feature / product behavior status: [`docs/features.md`](features.md) — at most one `active`; `passing` requires that item’s verification.
