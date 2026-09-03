# Demo recording plan — planned finished runtime 2:36 (hard ceiling 2:40)

One case, one prompt, one visible safety boundary. The recording is captured in the
**OpenAI Codex interface** against the deployed top-level page, and it must show real
Site Tool discovery and real tool calls. The in-app step-through rehearsal is for
practice pacing and browser fallback only; it is never a substitute for WebMCP
evidence and must not appear in the final take.

Hard rules for this recording:

- The first ten seconds are the problem and the stakes, not a silent tour. The
  opening voiceover plays over live camera motion — the fresh session starting, the
  sidebar hiding, and the full-page scan — so the hook stays a hook. No project name,
  no feature list, no "in this video".
- **The recorded video itself opens with a fresh Codex session starting and the
  Codex sidebar being hidden immediately after, both on camera.** Neither step
  happens off-camera before recording; see the shot plan below.
- **Before the main prompt is pasted, the whole page is shown once**: a smooth
  scroll from the very top to the very bottom, a brief hold, then a smooth scroll
  back to the top. This scan *is* the visual for the opening hook, not a separate
  pause after it.
- Narration never reads the screen. The screen shows the numbers; the voice explains
  why they matter.
- Every state change on the page must be caused by a Codex tool call, except the one
  human confirmation click at 2:10. Scrolling, panning, and the cursor/halo described
  below are camera and pointer moves only — they never count as state changes.
- Just before Codex retrieves information or changes page state, the in-app Browser
  scrolls to the specific area about to update and keeps it in frame, with a clearly
  visible cursor (or its post-production fallback, see below) resting on the exact
  identity, path, graph node, risk, or control the voiceover is discussing.

## Pre-roll setup (before recording starts)

| # | Operator action |
| --- | --- |
| 1 | Open the deployed HTTPS page as a top-level tab: `https://webmaxru.github.io/webmcp-access-review-workbench/`. Not in an iframe. Scroll it to the very top so the hero card is what's in frame first. |
| 2 | Activate **Reset case** so the exposure card reads `WAITING`, the path grid is skeletoned, and no receipt exists. |
| 3 | Verify the header chip reads `WebMCP · 9 top-level imperative tools ready`. If it does not, fix discovery before recording. |
| 4 | Close any existing Codex session so recording starts on Codex's session-picker/home screen, **not** already inside a session. Starting the fresh session on camera is the very first shot — see below. |
| 5 | Confirm the sidebar-hide control is one click away so it can be actuated immediately after the new session opens, with no delay. |
| 6 | Set display scaling so the exposure score, the delta pills, and the confirm control are legible at 1080p. |
| 7 | Copy the headline prompt below to the clipboard so it can be pasted in one motion. |
| 8 | If your capture/automation setup doesn't reliably render a visible system cursor, stage the post-production cursor-overlay pipeline (see "Post-production cursor fallback" below) so it's ready before the final export. |

## Exact Codex prompts

**Prompt A — the only prompt that drives the review (paste at 0:32):**

```text
Alex Morgan's contract ended Friday. Using this page's tools, find every path that still grants production deploy or customer-data export, tell me what would break if I removed all of them, then stage the smallest safe plan. Do not revoke anything.
```

**Prompt B — verification after the human confirmation click (paste at 2:15):**

```text
I confirmed it on the page. Read the receipt and re-check Alex's effective access.
```

**Prompt C — recovery only, if Codex stops mid-chain (cut from the final edit):**

```text
Continue with the remaining tools and stage the revised plan.
```

Do not add narration prompts, do not ask Codex to click Confirm, and do not ask it to
describe the tools instead of calling them.

## Shot-by-shot plan

| Time | On-screen action (operator + Codex) | Narration beat |
| --- | --- | --- |
| 0:00–0:04 | **Operator starts a brand-new Codex session on camera** — session picker to an empty thread, no prior turns, no scrollback. | "Alex Morgan's contract ended Friday." |
| 0:04–0:06 | **Operator hides the Codex sidebar immediately**, the same beat the session opens on. The final video must never show a session list, project names, or history. | "...Alex can still ship code to production and export customer data." |
| 0:06–0:16 | With the page hero in frame (case AR-042, HIGH PRIORITY, Alex Morgan, contract ended 28 Aug), smoothly scroll the whole page from top to bottom, passing the skeletoned path grid, the `WAITING` exposure card, and the synthetic-data footer. | "Nobody has noticed... it's inherited. Every offboarding team knows this problem." |
| 0:16–0:19 | Hold briefly at the very bottom of the page. | "The truth is buried in an access console nobody has time to read." |
| 0:19–0:24 | Smoothly scroll back up, landing exactly on the hero card as the line lands, ready for the chip highlight next. | "...pasting screenshots into a chat window gets you a guess, not a path you can defend." |
| 0:24–0:39 | Highlight the `WebMCP · 9 top-level imperative tools ready` chip with a cursor/halo resting on it while Codex's discovered Site Tools list is shown. Paste **Prompt A** at 0:32 and send. | The reframe: the page hands the agent tools, not pixels. |
| 0:39–0:56 | **Codex calls `get_identity_context`, then `get_effective_access`.** Just before each call resolves, scroll the Browser so the identity summary card — then the effective-access path grid — is centered in frame; a visible cursor/halo rests on Alex Morgan's identity chip, then on each of the four resolving path cards in turn. Keep both the tool-call trace and the app visible. ⏩ *speed-ramp any dead air between the two calls.* | The agent works; the app answers in real state. |
| 0:56–1:21 | **Codex calls `trace_permission_path`.** Scroll the Browser so path card **02 · Nested group** and its membership graph are centered before the trace lands; the cursor/halo tracks Contractors → Platform Contributors → Release Manager across the graph, then parks on the cycle-back edge as it's named. Operator clicks path card 02 once so the "WHY THIS COUNTS" explanation is on screen. ⏩ *speed-ramp latency between trace calls if Codex traces all four.* | The inherited chain, and the cycle the traversal refuses to double-count. |
| 1:21–1:37 | **Codex calls `find_access_risks`, then `simulate_access_changes` with `remove_all`.** Scroll so the red **BREAKAGE FOUND IN SIMULATION** card is fully in frame the moment it appears; hold a cursor/halo on the Incident Relay rollback dependency line while it's named. Hold on the card. | The judgment call a checklist gets wrong. |
| 1:37–1:55 | **Codex calls `simulate_access_changes` with `preserve_oncall`, then `preview_access_delta`.** Keep the exposure score and delta pills in frame; track the cursor/halo across the 92 → 18 animation, then onto the reassignment badge as each is named. | The plan is revised, not abandoned. |
| 1:55–2:10 | **Codex calls `stage_access_changes`, then `get_access_review_receipt`.** Scroll the staging drawer fully into frame as it opens; move the cursor/halo across `− 5 removed`, then `↪ 1 reassigned`, then `0 changes before confirmation`, then onto the `not_confirmed` answer, in the order the voiceover reads them. ⏩ *speed-ramp the staging round-trip.* | The boundary: staging is a tool, confirming is not. |
| 2:10–2:17 | **Operator clicks `Confirm staged review`** — the visible normal page control, at full speed, no ramp, with the cursor (or its post-production halo) resting on the button through the click. The read-only receipt `ARR-2026-0902-0042` replaces the button. Paste **Prompt B** at 2:15. | The last step is human. |
| 2:17–2:31 | **Codex calls `get_access_review_receipt`, `get_effective_access`, `find_access_risks`.** Scroll to keep the receipt ID, then "0 sensitive grants", then the service-owned rollback path in frame in turn, with the cursor/halo following each. ⏩ *speed-ramp between the three verification calls.* | The agent verifies the human's decision instead of making it. |
| 2:31–2:36 | Wide final frame, cursor/halo cleared: confirmed drawer, receipt, and the synthetic-data footer both visible. | Closing impact line. |

## Browser scroll & cursor targets (per Codex event)

Concrete mapping from each Codex event to the area the Browser scrolls to just
before it lands, and where the visible cursor/halo rests while the voiceover
discusses it:

| Codex event | Scroll target (just before the event lands) | Cursor / halo focus |
| --- | --- | --- |
| `get_identity_context` | Identity summary card | Alex Morgan's identity chip |
| `get_effective_access` | Effective-access path grid | The four resolving path cards, in order |
| `trace_permission_path` (path 02) | Path card 02 + membership graph | Contractors → Platform Contributors → Release Manager chain, then the cycle-back edge |
| `find_access_risks` / `simulate_access_changes(remove_all)` | Red BREAKAGE FOUND IN SIMULATION card | Incident Relay rollback dependency line |
| `simulate_access_changes(preserve_oncall)` / `preview_access_delta` | Exposure score + delta pills | 92 → 18 animation, then the reassignment badge |
| `stage_access_changes` / `get_access_review_receipt` (pre-confirm) | Staging drawer | `− 5 removed`, `↪ 1 reassigned`, then the `not_confirmed` answer |
| Human **Confirm staged review** click | Confirm control | The button itself, full-speed click, visible cursor/halo |
| `get_access_review_receipt` / verification calls | Receipt panel, then effective-access summary | Receipt ID, then "0 sensitive grants", then the service-owned rollback path |

## Post-production cursor fallback

Codex/background automation does not always render a visible system cursor during
Site Tool calls. If the raw capture is missing a cursor at any moment in the table
above:

- Overlay a high-contrast synthetic cursor in post, with a subtle click halo on the
  single human confirmation click, synchronized to the exact recorded coordinates
  where the real interaction happened. Never invent or reposition a target.
- The overlay is a visual pointer only. It must never be timed, sized, or animated in
  a way that implies an extra click, an extra state change, or an action that did not
  really happen — every page state change still comes from a genuine Codex tool call
  or the one human confirmation click.
- If the system cursor **is** captured natively in a shot, do not add an overlay on
  top of it. A take can mix native-cursor shots and overlay shots as long as each
  looks consistent within its own shot.

### Sections to accelerate in post

Speed up only where nothing changes on screen. Never speed up a moment a judge must
read, and never speed up the 0:00–0:24 opening (session start, sidebar hide, page
scan) — it carries the hook and must play at full speed.

- 0:39–0:56 — gap between the identity and effective-access calls.
- 0:56–1:21 — repeated `trace_permission_path` round-trips.
- 1:55–2:10 — staging round-trip before the drawer opens.
- 2:17–2:31 — gaps between the three verification calls.

Do **not** accelerate: the breakage card at 1:21–1:37, the 92 → 18 transition, the
`not_confirmed` answer, or the confirmation click at 2:10.

If real latency pushes the raw take past the challenge's 3:00 hard limit, tighten the
ramps above rather than cutting the breakage moment or the confirmation boundary.
Delivered runtime must stay comfortably under 3:00 **and below the 2:40 internal
target**; 2:36 is the plan. The opening choreography (session start, sidebar hide,
full-page scan) is sized to fit inside the existing 0:00–0:24 window, so it adds no
extra runtime — if a real take still runs long, shorten static holds (the final wide
frame at 2:31–2:36 first) before touching any of the ramps above.

## Narration

The spoken transcript lives in `submission-assets/VOICEOVER.txt`, and the timed
caption file that matches it is `submission-assets/demo-captions.srt`. Record voice
against the caption timings first, then cut the picture to the voice.

## Practice takes with the step-through rehearsal

For dry runs without Codex, click **Start step-through rehearsal**, then **Next** at
each transition. Each state holds until the next click, so pacing is easy to rehearse.

| Recording beat | Rehearsal equivalent |
| --- | --- |
| 0:00–0:24 | Not modeled by rehearsal — there is no Codex session to start. Practice the session-start/sidebar-hide/full-page-scan choreography against the live page manually, on its own, before or after a rehearsal pass. |
| 0:39–0:56 | Start rehearsal, then **compute effective access** |
| 0:56–1:21 | **trace permission paths**, then click path card 02 |
| 1:21–1:37 | **flag access risks**, then **simulate full removal** |
| 1:37–1:55 | **propose on-call reassignment** |
| 1:55–2:10 | **stage the review** (rehearsal ends here) |
| 2:10–2:31 | Outside rehearsal: the visible confirmation control, then real Codex reads |

Rehearsal never activates confirmation. After a confirmed review, **Reset case** must
be activated before rehearsal can start again.

## Claim discipline

Statements that must not appear in narration, captions, or on-screen text:

- That any real permission, identity, token, or system was changed. Confirmation
  mutates in-memory demo state only.
- That WebMCP revoked, applied, or approved anything. No WebMCP tool confirms.
- That the product prevents breaches, proves compliance, or replaces an access owner.
- Any claim that the confirmation control is technically unreachable by the agent
  host. It is a normal page control outside the WebMCP tool surface; ordinary browser
  actuation remains subject to Codex and browser safety confirmation.
- That the post-production cursor overlay (if used) represents any additional click,
  automation, or state change. It is a synchronized visual pointer over a real
  recorded interaction, nothing more.
