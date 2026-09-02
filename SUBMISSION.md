# Devpost submission copy

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

- **Live demo:** https://webmaxru.github.io/webmcp-access-review-workbench/
- **Source:** https://github.com/webmaxru/webmcp-access-review-workbench
  — currently private and therefore not yet challenge-eligible.
- **Video:** `submission-assets/demo-draft.mp4` is a 2:42 narrated,
  captioned, watermarked rehearsal storyboard. Replace it with a public YouTube
  recording that shows real Codex Site Tool discovery and calls.
