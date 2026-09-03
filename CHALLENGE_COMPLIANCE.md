# Challenge compliance checklist

## Submission links

- **Configured live URL:** https://webmaxru.github.io/webmcp-access-review-workbench/
  (GitHub Pages deployment and anonymous HTTP 200 smoke test passed on
  2026-09-03; keep it free and unrestricted through September 21, 2026 at
  5:00 p.m. PT)
- **Source repository:** https://github.com/webmaxru/webmcp-access-review-workbench
  (public; GitHub detects the root MIT license)
- **Local recording policy:** MP4 drafts and final masters remain only under the
  ignored `submission-video/` directory and are not committed.
- **Published video:** https://youtu.be/q2ydz9Y1_L8 — 2:16, under three minutes,
  showing real Codex Site Tool discovery and calls

The repository is public and its configured GitHub Pages homepage is serving the
expected app.

## Required package

- [x] Runnable Vite + React + TypeScript source
- [x] Plain CSS responsive UI
- [x] Static-hostable; no runtime secrets or external APIs
- [x] Nine top-level imperative WebMCP tools
- [x] `document.modelContext` with older navigator fallback
- [x] Awaited registration in `try/catch`
- [x] AbortController registration lifecycle and execution signal handling
- [x] Code-level input validation
- [x] Accurate annotations: only receipt reading is read-only; all fixture output is trusted
- [x] Synchronous external-store publication before tool results return
- [x] Visible normal confirmation control excluded from the WebMCP tool surface
- [x] Read-only receipt after confirmation
- [x] Deterministic step-through rehearsal clearly labeled as a fallback
- [x] Cycle-safe access graph and exact scenario invariants
- [x] Domain and WebMCP tests
- [x] README setup, architecture, tool table, browser testing, limitations
- [x] Devpost-ready submission copy
- [x] Timed demo storyboard and full transcript
- [x] Natural-language dialogues and recovery path
- [x] Deterministic/routing test plan
- [x] Vercel and Netlify hosting headers
- [x] Repository-side GitHub Pages deployment workflow
- [x] MIT license
- [x] Static social/demo SVG
- [x] Working public HTTPS deployment anonymously smoke-tested

## Scenario verification

| Requirement | Implementation |
| --- | --- |
| Approx. 50 users / 10 groups / 3 apps | Exactly 50 / 10 / 3 synthetic fixtures |
| Alex Morgan offboarding focus | Single visible case AR-042 |
| Four distinct permission paths | Direct role, nested group, API token, project inheritance |
| Six sensitive capability grants | 2 + 2 + 1 + 1 |
| Graph cycle safety | Contractors → Platform Contributors → Release Observers → Contractors is detected and skipped |
| Five unnecessary grants removed | Safe simulation and staged plan return exactly 5 |
| One dependency preserved/reassigned | Production rollback moves to `svc-oncall-relay` |
| One breakage warning | First `remove_all` simulation flags Incident Relay |
| No WebMCP revocation | Tool surface ends at staging/cancellation/receipt reading |
| Confirmation boundary | Normal visible button invokes `confirmStage`; it is not a WebMCP tool, while ordinary browser actuation remains subject to host safety confirmation |

## OpenAI-specific limitations

- OpenAI ChatGPT/Codex Site Tools currently require imperative JavaScript tools
  registered by the top-level page for this use case.
- Declarative tools are not used because current OpenAI Site Tools do not discover
  them.
- Iframe-registered tools are not used because current OpenAI Site Tools do not
  discover them. Hosting must open this app directly as the top-level document.
- The current `execute(input, { signal })` callback does not provide
  `ModelContextClient.requestUserInteraction`; therefore confirmation is a separate,
  visible normal page control rather than a WebMCP tool. Ordinary browser actuation
  may still reach it, subject to Codex/browser safety confirmation.
- Native support is preview-stage and may vary by browser/provider version.
- The step-through rehearsal holds each deterministic state until continued. It is
  only a demonstration path and is not evidence that a browser exposed or an agent
  invoked WebMCP tools. It is disabled after confirmation until **Reset case** is
  explicitly activated.

## Publication, license, source, and video

- Repository publication is complete and the GitHub API reports public visibility.
- MIT license is included at `LICENSE`.
- All source required to run the demo is included, excluding installed dependencies.
- Four clean screenshots and exact captions are included.
- GitHub Pages workflow and anonymous HTTPS smoke test passed on 2026-09-03.
- The public 2:16 demo is available at https://youtu.be/q2ydz9Y1_L8.
- Judge credentials: none required.

## Claims boundary

This synthetic prototype demonstrates a review interaction pattern. It does not
claim breach prevention, compliance certification, correctness against a real
identity provider, or production authorization controls.
