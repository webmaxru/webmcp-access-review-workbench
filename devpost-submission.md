# Submission information

## Project name

**Least-Privilege Access Review Workbench — Remove Risky Access Without Breaking Production**

## Tagline

Trace every hidden access path, remove unnecessary grants, and preserve the one
dependency production still needs.

## 1. Inspiration

Offboarding reviews look simple until access is inherited through nested groups,
project roles, personal tokens, and shared operational dependencies. The hardest
part is not listing permissions; it is showing why each permission exists, predicting
what would break, and keeping confirmation in a visible browser safety boundary. We built the
Least-Privilege Access Review Workbench to demonstrate how WebMCP can make that reasoning structured and visible
without turning an AI agent into an invisible administrator.

## 2. What it does

The demo opens on one urgent synthetic case: Alex Morgan's contract ended Friday,
but production deploy and customer-data export access remain. An agent can use nine
top-level imperative WebMCP tools to resolve Alex's identity, compute effective
access, trace four distinct paths, flag risks, and simulate a least-privilege change.

The first simulation intentionally finds a breakage: an on-call Incident Relay
depends on a rollback grant tied to Alex. The plan is revised to remove exactly five
unnecessary grants while reassigning one rollback dependency to a service identity.
The agent can preview and stage that plan, but no WebMCP tool revokes or confirms it.
A visible normal page control commits only the mocked in-memory review, after which a
read-only receipt becomes available. Ordinary browser actuation may still reach that
control, subject to Codex/browser safety confirmation.

The centerpiece is a live SVG graph with red risk paths, amber staged removals, and a
green preserved dependency, plus before/after exposure, path explanations, an
activity timeline, and WebMCP status. A clearly labeled step-through rehearsal
drives the same domain service when native WebMCP is unavailable and holds every
intermediate state until the next click.

## 3. How we built it

The Least-Privilege Access Review Workbench is a static Vite + React + TypeScript application with plain CSS and no
backend, secrets, or external APIs. A deterministic domain service models 50 users,
10 groups, 3 applications, four effective paths, six sensitive grants, simulation,
staging, confirmation, and receipt state.

WebMCP tools are registered imperatively from the top-level page. The integration
prefers `document.modelContext`, falls back to `navigator.modelContext` for older
Chrome previews, awaits every `registerTool` call inside `try/catch`, and uses an
`AbortController` for registration cleanup. Tool callbacks follow the current
`execute(input, { signal })` shape, validate inputs in code, and return only after
visible state has synchronized. Accurate read-only and untrusted-content annotations
describe each contract.

Vitest covers cycle-safe nested groups, exact scenario counts, cancellation,
registration cleanup, validation, and the rule that no durable mocked mutation occurs
before visible confirmation. Tests also verify atomic tool registration, stale-plan
rejection, and consistent post-confirmation ownership. Vercel and Netlify configs provide top-level static
hosting, a `tools=(self)` permissions policy, origin isolation, and no iframe path.

## 4. Challenges, learnings, and what is next

The central challenge was designing a useful agent workflow around a strict safety
boundary. “Stage” has to be stateful enough to make the plan reviewable, while
remaining clearly different from “apply.” Sharing one domain service between WebMCP,
the UI, and rehearsal avoided hidden agent-only behavior and made the safety claim
testable.

We also learned that effective access is a graph problem, not a flat-role problem.
Cycle-safe traversal and path-level explanations matter as much as the final count.
Compatibility required targeting today's real surface: top-level imperative tools,
asynchronous registration, current execution cancellation, and no dependency on
declarative or iframe discovery in OpenAI Site Tools.

Next, the same interaction model could be connected to read-only exports from real
identity systems and to an existing, separately authorized change-management flow.
That would require production authentication, policy evaluation, audit storage,
tenant isolation, and security review. This prototype does not claim to prevent
breaches, certify compliance, or replace authoritative access owners; it demonstrates
a transparent least-privilege review pattern.

## Submission links and publication status

- **Configured live URL:** https://webmaxru.github.io/webmcp-access-review-workbench/
  — deployed through this public repository's GitHub Pages Actions workflow and
  anonymously smoke-tested with HTTP 200 on 2026-09-03. Access must remain free
  and unrestricted through September 21, 2026 at 5:00 p.m. PT.
- **Source:** https://github.com/webmaxru/webmcp-access-review-workbench
  — public; GitHub detects the root MIT license.
- **Video:** https://youtu.be/q2ydz9Y1_L8

## YouTube title and description

**Title**

`Least-Privilege: Alex Left Friday. Why Does He Still Have Production Access? | WebMCP`

**Description**

```text
Alex's contract ended Friday, but four hidden access paths still reach production and customer data. Removing everything would also break an on-call rollback dependency.

In this 2:16 Codex demo, the Least-Privilege Access Review Workbench exposes nine WebMCP tools that resolve identity, trace nested access, flag risks, simulate removal, and stage the smallest safe plan. Codex removes five unnecessary grants, reassigns one shared dependency to a service identity, and leaves the irreversible confirmation behind a visible human control.

The scenario is deterministic and synthetic. It demonstrates an auditable review pattern, not production IAM enforcement or a compliance guarantee.

Try it: https://webmaxru.github.io/webmcp-access-review-workbench/
Source: https://github.com/webmaxru/webmcp-access-review-workbench

Built for the WebMCP Challenge.

#WebMCP #AIAgents #LeastPrivilege #Cybersecurity #Codex
```

## Run and judge the source

Requirements: Node.js 20.19+ or 22.12+.

```powershell
npm install
npm run dev
npm test
npm run typecheck
npm run build
npm run scan:webmcp
```

Open the Vite URL directly as a top-level page. Use the ChatGPT desktop in-app
browser or Google Chrome 149 or later. Chrome testing requires a secure context
(`http://localhost` or HTTPS) and
`chrome://flags/#enable-webmcp-testing`. Confirm that nine tools register, invalid
inputs return corrective errors, the unsafe simulation is revised before staging,
and no WebMCP tool can activate the visible confirmation control.

Repository history begins with this challenge implementation; no separate
pre-existing application is evidenced. The access-review domain model, UI, WebMCP
surface, tests, and documentation are the hackathon work.

## Preparation appendix — local draft only

The original write-up above is preserved. This appendix organizes the upload packet
and outstanding answers; do not paste the preparation notes or TODOs into the public
project description.

### Title and one-line summary

- Current title: 89 characters; the Devpost project API allows at most 60.
- Proposed shorter title, pending author approval: **Least-Privilege Access Review Workbench** (39 characters).
- Keep the existing tagline above. The longer original title may remain in the write-up.

### Why this matters

The target audience is an access reviewer handling offboarding. The workbench makes
inherited permissions and shared operational dependencies inspectable in one place,
so a reviewer can see why removing everything is different from preparing a
least-privilege plan that preserves the required rollback dependency.

### How we used AI

The application exposes structured WebMCP operations to an external AI agent. The
agent can sequence identity lookup, path tracing, risk analysis, simulation,
revision, and staging while the same evidence appears in the UI. The application
itself contains no embedded model API, and the synthetic access calculations are
deterministic rather than model-generated. The recorded demo is documented as using
OpenAI Codex Site Tools; the author must confirm the actual tested clients below.

### How we used Codex

TODO — author confirmation: describe Codex's actual role in building, debugging,
testing, and preparing this project, and name any additional AI tools used. The
repository credits the WebMCP Agent Skill from the Web AI Agent Skills collection.
Do not infer a detailed development history merely from the finished source.

### Key features and architecture

The existing sections 2 and 3 are the product and architecture copy. The implementation
contains one shared `AccessReviewService`, React rendering, nine imperative tools
registered from the top-level page, and deterministic fixture data. Proposed
Built with tags: WebMCP, React, TypeScript, Vite, CSS, Vitest, GitHub Pages.

### Judge testing instructions

No login or credentials are required. Open the live URL as a top-level page in a
WebMCP-capable browser. Confirm nine tools are available, then ask the agent to
review Alex Morgan's remaining production and export access, simulate removing it,
preserve the on-call dependency, and stage the revised plan without confirming it.
The unsafe simulation should report one rollback dependency breakage. The revised
plan should propose five removals and one reassignment. A receipt must not exist
before the visible confirmation control is activated. After the reviewer confirms
the mocked plan, the receipt and current access view should show zero sensitive
grants for Alex and one rollback grant owned by `svc-oncall-relay`.

Reload or use Reset case to start again. The labeled rehearsal is a UI fallback,
not evidence of native WebMCP discovery or agent tool execution.

### Screenshot shot list

Four existing 1600-by-900 screenshots were inspected and are referenced here only;
none was captured, modified, or uploaded during preparation.

1. `submission-assets/screenshots/01-overview.png` — Initial offboarding case,
   synthetic organization counts, and the workbench layout.
2. `submission-assets/screenshots/02-staged-review.png` — Proposed exposure change
   from 92 to 18 and preserved rollback dependency. The image visibly says
   "Rehearsal staged"; describe it as a UI illustration, not proof of agent calls.
3. `submission-assets/screenshots/03-confirmation-gate.png` — Inspectable access
   paths, review timeline, five proposed removals, one reassignment, and zero
   changes before visible confirmation.
4. `submission-assets/screenshots/04-confirmed-receipt.png` — Mocked final ownership,
   zero Alex grants, service-owned rollback, and the read-only receipt.

### Demo video outline and evidence

Use the existing video URL and the detailed `DEMO_SCRIPT.md`,
`submission-assets/VOICEOVER.txt`, and `submission-assets/demo-captions.srt`.
The intended sequence is: offboarding problem; native Codex tool discovery and
calls; unsafe simulation; revised five-removal/one-reassignment plan; staging;
visible reviewer confirmation; receipt and final ownership. Repository documentation
reports a 2:16 narrated video. Verify Public visibility on YouTube, duration below
three minutes, audible explanation, and real WebMCP calls before the final review.

### Known limitations

Synthetic single-case data, in-memory state that resets on reload, illustrative
exposure scores, and no production IAM enforcement, authentication, or compliance
guarantee. Browser support may vary. The live deployment uses GitHub Pages; the
Vercel/Netlify custom-header configurations are alternatives, not claims about
headers actually emitted by GitHub Pages.

### Submission readiness notes

Preparation checks on 2026-09-03:

- `npm test`: 30 tests passed across 3 files.
- `npm run typecheck`: passed.
- Live URL: anonymous HTTP 200; expected app title and root were present.
- GitHub API: repository public; MIT license detected.
- YouTube oEmbed: expected video title and author returned. This alone does not
  distinguish Public from Unlisted visibility or verify audio and duration.
- Earliest local commit: `e3c7cb5`, 2026-09-02, "Build WebMCP least-privilege access review workbench".
- Full local security scan and final live requirements review remain for
  `$submit-project`. No external project creation, editing, or upload occurred here.
- Clarify public video copy so actions before confirmation are described as
  simulation/staging, not revocation of real access.

### TODO Official Form Fields

These are the live WebMCP event fields returned by Devpost on 2026-09-03. Do not
invent personal answers. No Codex session ID is requested by this form.

| Field ID | Official field | Draft answer / remaining input |
| --- | --- | --- |
| 28249 | Submitter Type | Individual — confirmed by the author |
| 28250 | Country of residence of yourself and team members if applicable | Norway — confirmed by the author |
| 28251 | If submitting on behalf of an organization, what is the organization name? | Not applicable — Individual entry |
| 28252 | App Status | New — based on the author's scope statement and repository history |
| 28253 | If Existing, explain what you updated during the submission period. (We recommend explaining this in your text description, too!) | Not applicable if New is confirmed |
| 28254 | Live URL that judges can access using ChatGPT’s in-app browser or Google Chrome with WebMCP enabled | https://webmaxru.github.io/webmcp-access-review-workbench/ |
| 28255 | If applicable, testing instructions for application - If you have credentials for your URL, you can put them here. | Use Judge testing instructions above; no credentials required |
| 28256 | URL to your PUBLIC Code Repo (on Github, Gitlab, or Bitbucket) | https://github.com/webmaxru/webmcp-access-review-workbench |
| 28257 | Which agent(s) or client(s) did you test your WebMCP tools with? | TODO confirm: OpenAI Codex Site Tools, as documented; do not claim Chrome testing without confirmation |
| 28258 | Which AI tools have you leveraged while working on this project? | TODO author-provided tools and usage |
| 28259 | Describe the level of learning you/your team derived from the project | Significant — confirmed by the author |
| 28260 | Did you gain AI value that you can use in your career? | Yes — confirmed by the author |
