# Challenge compliance checklist

## Submission links

- **Live HTTPS URL:** https://webmaxru.github.io/webmcp-access-review-workbench/
- **Source repository:** https://github.com/webmaxru/webmcp-access-review-workbench
  (currently private; must be public before submission)
- **Draft video:** `submission-assets/demo-draft.mp4` (2:42, narrated,
  captioned, and visibly watermarked as a rehearsal storyboard)
- **Required final video:** public YouTube recording under three minutes showing
  real Codex Site Tool discovery and calls

The repository is currently private by instruction. It must be made public before the
challenge deadline by the repository owner. The persistent demo is published separately from the private source repository.

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
- [x] MIT license
- [x] Static social/demo SVG

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

- Repository publication remains a manual owner step.
- MIT license is included at `LICENSE`.
- All source required to run the demo is included, excluding installed dependencies.
- Four clean screenshots and a 2:42 narrated rehearsal storyboard are included.
- Record a real Codex Site Tool take using `DEMO_SCRIPT.md`, then upload it
  publicly to YouTube.
- Judge credentials: none required.

## Claims boundary

This synthetic prototype demonstrates a review interaction pattern. It does not
claim breach prevention, compliance certification, correctness against a real
identity provider, or production authorization controls.
