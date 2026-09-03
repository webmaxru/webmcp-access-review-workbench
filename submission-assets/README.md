# Submission recording assets

This folder contains the narration and upload-ready captions for the current
**2 minute 16 second** final master (under the 2:40 ceiling). The
shot-by-shot plan, the exact Codex prompts, the operator setup, the on-camera opening
(fresh session started and sidebar hidden live, then a full top-to-bottom-to-top page
scan before the prompt), the per-event Browser scroll/cursor choreography, the
post-production cursor fallback, and the sections to speed-ramp in post all live in
`../DEMO_SCRIPT.md`. The in-app rehearsal is step-through: each intermediate state
holds until the next click, which makes practice takes easy to pace, but it must not
appear in the final take.

Generated assets:

- `VOICEOVER.txt`
- `demo-captions.srt` — destination for the generated upload-ready captions that
  match the current 2:16 final master.
- `screenshots/01-overview.png`
- `screenshots/02-staged-review.png`
- `screenshots/03-confirmation-gate.png`
- `screenshots/04-confirmed-receipt.png`

Recorded video files are intentionally not part of this folder or the repository.
Keep rehearsal captures, drafts, and final masters only in the ignored
`../submission-video/` directory.

Live demo: https://webmaxru.github.io/webmcp-access-review-workbench/

Source: https://github.com/webmaxru/webmcp-access-review-workbench
(public; the root MIT license is detected by GitHub).

## Required recording evidence

The final recording must show **real OpenAI Codex Site Tool calls** discovering and
invoking the page's imperative WebMCP tools. Rehearsal mode is useful for timing and
as a deterministic browser fallback, but a recording that shows only the rehearsal
button is not sufficient evidence of WebMCP integration.

At minimum, visibly demonstrate:

1. A fresh Codex session **started on camera**, with the sidebar hidden immediately
   after, so only the product and the tool calls are on screen from the first frame.
2. Before the main prompt, the entire page shown once: a smooth scroll from the very
   top to the very bottom, a brief hold, and a smooth scroll back to the top, with
   the urgent opening voiceover playing over the scan so the first ten seconds stay a
   hook rather than a silent tour.
3. Codex discovers the nine top-level tools; the page chip reads
   `WebMCP · 9 top-level imperative tools ready`.
4. A single natural-language prompt (Prompt A in `../DEMO_SCRIPT.md`) drives the
   identity, effective-access, tracing, risk, simulation, preview, and staging chain,
   with the page state changing as each tool returns, and the in-app Browser
   scrolling to the specific area about to update just before each event lands (see
   "Browser scroll & cursor targets" in `../DEMO_SCRIPT.md`), keeping that area in
   frame with a visible cursor or cursor halo over the exact identity, path/graph
   node, risk, or control being discussed.
5. The first simulation reports the Incident Relay rollback breakage, with the
   Browser scrolled to and holding on the breakage card.
6. The revised plan shows exactly 5 removals and 1 reassigned dependency, and
   exposure moves 92 → 18, with the cursor/halo tracking the exposure score and delta
   pills as they change.
7. `get_access_review_receipt` reports no receipt before confirmation.
8. The visible normal **Confirm staged review** control is activated by the human,
   full speed, with a visible cursor or cursor halo on the button through the click.
   It is not a WebMCP tool; ordinary browser actuation remains subject to
   Codex/browser safety confirmation.
9. Codex reads receipt `ARR-2026-0902-0042`, then verifies 0 Alex grants and the
   service-owned rollback path, with the Browser scrolled to and the cursor/halo on
   each of those in turn.

If the capture/automation pipeline doesn't reliably render a visible system cursor,
post-production may overlay a high-contrast synthetic cursor with a subtle click halo
synchronized to the real recorded interaction coordinates (see "Post-production
cursor fallback" in `../DEMO_SCRIPT.md`). The overlay is a visual pointer only — it
must never imply a click, action, or state change that didn't really happen, and
should not be added on top of a shot where the system cursor was already captured.

Speed ramps are allowed only across latency gaps where nothing changes on screen (see
"Sections to accelerate in post" in `../DEMO_SCRIPT.md`). Never speed up the opening
0:00–0:24 session-start/sidebar-hide/page-scan — it carries the hook. The breakage
card, the 92 → 18 transition, the `not_confirmed` answer, and the confirmation click
must play at full speed.

Do not imply that WebMCP revoked live access. The confirmation changes only the
mocked in-memory fixture, and all identities, applications, tokens, and findings are
synthetic.

The remaining media blocker is publication: a validated 2:16 narrated final
master showing real Codex Site Tool discovery and calls exists only in ignored
`submission-video/`. Upload it publicly to YouTube and attach
`demo-captions.srt`.
