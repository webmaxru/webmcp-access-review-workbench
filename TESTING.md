# Testing guide

## Automated checks

```powershell
npm install
npm test
npm run typecheck
npm run build
npm run scan:webmcp
```

Key assertions:

- organization fixture is exactly 50 users, 10 groups, 3 applications;
- nested membership is derived from the graph and disappears when its role edge is removed;
- `Contractors → Platform Contributors → Release Observers → Contractors` terminates
  safely;
- exact result is 4 paths and 6 capability grants;
- unsafe simulation removes 6 and emits exactly 1 breakage warning;
- revised simulation removes 5 and preserves/reassigns 1;
- simulation and staging leave durable mocked revocations empty;
- activating the visible normal confirmation control calls `confirmStage`, creating
  5 durable in-memory revocations, reassigning rollback, and creating a receipt;
- post-confirmation reads return 0 Alex grants, 1 service-owned rollback, and 0 risks;
- changed simulations invalidate staging and version/hash checks reject stale plans;
- direct stale confirmation clears both staged and simulated analysis, records a
  warning, and permits immediate re-analysis/restaging;
- topology changes invalidate obsolete simulation state even when no plan is staged,
  so preview recomputes current counts and hash;
- plan hashes bind grant IDs, effective path topology, and proposed action sources;
- confirmed cases reject rehearsal until the explicit reset control resets state;
- all 9 tools register atomically; the first async failure immediately unregisters
  every attempted name, aborts registration signals, and never reports ready;
- invalid subjects and missing safety acknowledgment return corrective errors;
- all nine callbacks support `execute(input)` when options are omitted;
- already-aborted execution signals stop work before mutation;
- mutating callbacks have no post-mutation render wait or pending promise;
- receipt and UI count copy derive from actual plan arrays, including a
  topology-changed three-removal result.
- graph edges, source nodes, headings, and descriptions derive from current active
  paths and suppress topology that is no longer effective;
- stored snapshots are deep-frozen and returned receipt data is isolated from caller
  mutation.

## Deterministic tool evaluations

Use the page as a top-level secure document. Inputs below are JSON objects.

| Tool and input | Expected output |
| --- | --- |
| `get_identity_context` `{"subject":"Alex Morgan"}` | `id=usr_alex_morgan`, `status=contract_ended`, `contractEnded=2026-08-28` |
| `get_effective_access` `{"subject":"Alex Morgan"}` | `pathCount=4`, `capabilityGrantCount=6` |
| `trace_permission_path` `{"subject":"Alex Morgan","pathId":"path_nested_group"}` | Nodes include Contractors, Platform Contributors, Release Manager, Atlas Deploy |
| `find_access_risks` `{"subject":"Alex Morgan"}` | 4 risk strings, including shared rollback dependency |
| `simulate_access_changes` `{"subject":"Alex Morgan","mode":"remove_all"}` | `removedGrantIds.length=6`, one Incident Relay warning, `afterScore=8` |
| `simulate_access_changes` `{"subject":"Alex Morgan","mode":"preserve_oncall"}` | `removedGrantIds.length=5`, `preservedGrantIds=["grant_prod_rollback_shared"]`, no warnings, `afterScore=18` |
| `preview_access_delta` `{"subject":"Alex Morgan"}` | `before=92`, `after=18`, `removed=5`, `preserved=1`, `durableMutation=false` |
| `stage_access_changes` `{"subject":"Alex Morgan","acknowledgeNoRevocation":true}` | `status=staged`, `removedGrantCount=5`, `preservedDependencyCount=1`, `durableMutation=false` |
| `get_access_review_receipt` before click | `status=not_confirmed` |
| `get_access_review_receipt` after visible confirmation | `status=confirmed`, receipt ID `ARR-2026-0902-0042` |
| `get_effective_access` after visible confirmation | `pathCount=0`, `capabilityGrantCount=0`, `preservedDependencyCount=1`, owner `svc-oncall-relay` |
| `find_access_risks` after visible confirmation | Empty risk list; phase remains `confirmed` |
| `cancel_staged_access_review` `{"reviewId":"alex-offboarding-2026-09-02"}` | `status=cancelled`, `durableMutation=false` |

## Negative deterministic evaluations

| Input | Expected error |
| --- | --- |
| `{"subject":""}` | Subject required; suggests Alex Morgan / ID |
| `{"subject":"Sam"}` | Synthetic demo supports Alex Morgan only |
| `simulate_access_changes` with `mode="apply"` | Mode must be `remove_all` or `preserve_oncall` |
| `stage_access_changes` with acknowledgment omitted/false | Must acknowledge staging never revokes |
| receipt/cancel with a different review ID | Must use `alex-offboarding-2026-09-02` |
| Execute with an already-aborted signal | Abort error; no state transition |
| Execute any tool without an options object | Normal deterministic result |
| Abort after a mutating tool returns | No effect on the already committed synchronous result |
| Confirm after changing a staged simulation | Stage is invalidated; confirmation is rejected |
| Simulate, stage, or cancel after confirmation | Already-confirmed error; receipt and final visuals remain unchanged |

## Natural-language routing evaluations

Each prompt should route to the listed tool or sequence without manually naming it.

1. **“Who is Alex Morgan and when did the contract end?”**
   Expected: `get_identity_context`.

2. **“List every way Alex can deploy production or export customer records.”**
   Expected: `get_effective_access`, then one or more
   `trace_permission_path` calls.

3. **“Explain the group chain behind production approval.”**
   Expected: `trace_permission_path` with `path_nested_group`.

4. **“What would break if we removed all of Alex's access?”**
   Expected: `simulate_access_changes` with `remove_all`.

5. **“Keep anything the on-call service needs and show the smallest safe delta.”**
   Expected: `simulate_access_changes` with `preserve_oncall`, then
   `preview_access_delta`.

6. **“Prepare this for review but don't revoke anything.”**
   Expected: `stage_access_changes` with acknowledgment true.

7. **“Undo the staged proposal.”**
   Expected: `cancel_staged_access_review`.

8. **“Has the visible review control been confirmed yet?”**
   Expected: `get_access_review_receipt`; before activation it must not imply confirmation.

## Visible UI checks

- At 1440 px, graph and right rail are visible together.
- At 390 px, content forms a single readable column without horizontal page scroll.
- Keyboard focus is visible for rehearsal, path cards, revision, reset, and confirm.
- Graph has a title and description; status/warnings use live regions.
- `prefers-reduced-motion` disables meaningful transition duration.
- Step-through rehearsal advances one domain transition per click, holds each state,
  reaches staging, and does not activate confirmation.
- After confirmation, rehearsal is disabled until **Reset case** is activated.
- Before confirmation the drawer says `0 changes before confirmation`.
- Confirmation produces a read-only receipt and no further mutation control.
- After confirmation, the graph and path cards show 0 Alex grants and the
  `svc-oncall-relay` rollback path.
- The exposure heading changes from `Before → proposed` to
  `Original → current result` after confirmation.

## Browser/provider compatibility checks

- Open directly, not in an iframe.
- Confirm HTTPS or localhost secure context.
- Confirm `document.modelContext` on current builds; Chrome 146–149 may use the
  navigator fallback.
- Confirm nine tools in Site Tools/inspector and a ready status chip.
- Confirm any registration failure removes all successful registrations and reports
  zero exposed tools.
- Confirm only `get_access_review_receipt` advertises `readOnlyHint: true`.
  Identity, access, tracing, risk, simulation, preview, stage, and cancel tools all
  advertise `false` because they update visible workflow state.
- Confirm declarative discovery is not required.
- Confirm the normal confirmation button is absent from the WebMCP tool contracts.
  Ordinary browser actuation may still reach it and remains subject to
  Codex/browser safety confirmation.
