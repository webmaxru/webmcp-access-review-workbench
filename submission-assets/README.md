# Submission recording assets

This folder contains a draft voiceover and timed captions for a target runtime of
approximately **2 minutes 40 seconds**. The in-app rehearsal is step-through: each
intermediate state holds until the next click, which makes practice takes easy to
pace.

Generated assets:

- `VOICEOVER.txt`
- `demo-captions.srt`
- `demo-draft.mp4` — 1600×900 H.264/AAC rehearsal storyboard with embedded
  English captions and synthetic narration; visibly watermarked so it cannot be
  mistaken for the required Codex capture.
- `screenshots/01-overview.png`
- `screenshots/02-staged-review.png`
- `screenshots/03-confirmation-gate.png`
- `screenshots/04-confirmed-receipt.png`

Live demo: https://webmaxru.github.io/webmcp-access-review-workbench/

Source: https://github.com/webmaxru/webmcp-access-review-workbench
(currently private; must be public for challenge eligibility).

## Required recording evidence

The final recording must show **real OpenAI Codex Site Tool calls** discovering and
invoking the page's imperative WebMCP tools. Rehearsal mode is useful for timing and
as a deterministic browser fallback, but a recording that shows only the rehearsal
button is not sufficient evidence of WebMCP integration.

At minimum, visibly demonstrate:

1. Codex discovers the nine top-level tools.
2. A natural-language prompt invokes the identity, effective-access, tracing, risk,
   simulation, preview, and staging workflow.
3. The first simulation reports the Incident Relay rollback breakage.
4. The revised plan shows exactly 5 removals and 1 reassigned dependency.
5. `get_access_review_receipt` reports no receipt before confirmation.
6. The visible normal **Confirm staged review** control is activated. It is not a
   WebMCP tool; ordinary browser actuation remains subject to Codex/browser safety
   confirmation.
7. Codex reads receipt `ARR-2026-0902-0042`, then verifies 0 Alex grants and the
   service-owned rollback path.

Do not imply that WebMCP revoked live access. The confirmation changes only the
mocked in-memory fixture, and all identities, applications, tokens, and findings are
synthetic.

The remaining media blocker is a public YouTube video showing real Codex Site
Tool discovery and calls. A fresh GPT-5.6 Sol run completed against the deployed
top-level page on September 2, 2026. Codex discovered nine Site Tools, traced 4
effective paths carrying 6 sensitive grants, detected the full-removal rollback
breakage, staged 5 removals plus 1 reassignment to `svc-oncall-relay`, and
reported 92 → 18 with no durable mutation or receipt. That run was not
screen-recorded, so the included storyboard remains rehearsal media rather than
the required public video evidence.
