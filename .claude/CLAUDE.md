# CLAUDE.md

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Project Workflow

- Default local dev command for this project: `pnpm dev --host 127.0.0.1 --port 3000`
- For frontend / webpage issues, do not guess.
- For frontend / webpage issues, do not blindly overwrite existing code or structure.
- For bug fixes, error diagnosis, rendering anomalies, route issues, performance work, loading problems, or other cases where behavior correctness is in question, use browser / web tooling (including Playwright / MCP tools when available) to reproduce and verify before concluding.
- For routine non-bug feature additions or straightforward content / configuration updates, browser / MCP verification is not mandatory unless the change is risky or likely to affect existing behavior.
- Prefer direct diagnosis, concrete fixes, and concise solution-first responses.
- Keep explanations short; prioritize what changed, why it was broken, and how it was verified.

## 6. Verification Expectations

- When modifying webpage behavior or layout in a bug / error / performance context, verify the actual rendered result with browser tooling whenever available.
- Distinguish clearly between code-level reasoning and browser-confirmed behavior.
- If local dev instances, stale browser sessions, or cached sessions can affect results, call that out explicitly and re-verify on a clean instance.
