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
