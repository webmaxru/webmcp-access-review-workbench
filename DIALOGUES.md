# Agent dialogue fixtures

These dialogues use synthetic data. Representative responses are intentionally
concise and should remain grounded in tool outputs.

## Dialogue 1 — headline offboarding review

**Human**

> Alex Morgan's contract ended Friday. Find every path that still grants production
> deploy or customer-data export, preserve anything required by the on-call service,
> simulate the change, and stage the least-privilege review without revoking
> anything.

**Expected tool sequence**

1. `get_identity_context({"subject":"Alex Morgan"})`
2. `get_effective_access({"subject":"Alex Morgan"})`
3. `trace_permission_path` for each returned path ID
4. `find_access_risks({"subject":"Alex Morgan"})`
5. `simulate_access_changes({"subject":"Alex Morgan","mode":"remove_all"})`
6. `simulate_access_changes({"subject":"Alex Morgan","mode":"preserve_oncall"})`
7. `preview_access_delta({"subject":"Alex Morgan"})`
8. `stage_access_changes({"subject":"Alex Morgan","acknowledgeNoRevocation":true})`

**Representative agent response**

> I found 4 effective paths producing 6 sensitive grants: a direct Production
> Operator role, nested contractor groups, a personal export token, and inherited
> Mercury project membership. Removing all six would break Incident Relay rollback.
> I revised the plan to remove 5 grants from Alex and reassign the 1 required rollback
> dependency to `svc-oncall-relay`. Exposure previews at 92 → 18. The plan is staged;
> nothing has been revoked. The visible normal confirmation control is not a WebMCP
> tool; activate it through an allowed browser interaction if you accept the plan.

## Dialogue 2 — explain the hidden group path

**Human**

> Why does Alex still have production approval if there is no approval role on the
> profile?

**Expected tool sequence**

1. `get_effective_access({"subject":"Alex Morgan"})`
2. `trace_permission_path({"subject":"Alex Morgan","pathId":"path_nested_group"})`

**Representative agent response**

> Alex is directly in Contractors. Contractors nests into Platform Contributors,
> which grants Release Manager in Atlas Deploy. That role contributes production
> deploy and production approval. The membership graph also contains a cycle through
> Release Observers; traversal detects and ignores it, so the path is not double
> counted.

## Dialogue 3 — safe delta only

**Human**

> Show me the smallest safe change and the before-and-after exposure, but don't stage
> it yet.

**Expected tool sequence**

1. `get_effective_access({"subject":"Alex Morgan"})`
2. `find_access_risks({"subject":"Alex Morgan"})`
3. `simulate_access_changes({"subject":"Alex Morgan","mode":"remove_all"})`
4. `simulate_access_changes({"subject":"Alex Morgan","mode":"preserve_oncall"})`
5. `preview_access_delta({"subject":"Alex Morgan"})`

**Representative agent response**

> The smallest safe plan removes 5 unnecessary grants and reassigns 1 rollback
> dependency to the on-call service identity. The synthetic exposure score changes
> from 92 to 18. This is still a simulation: no plan is staged and no access changed.

## Failure and recovery

**Human**

> Review Sam.

**Tool attempt**

`get_identity_context({"subject":"Sam"})`

**Expected tool error**

> Unknown subject "Sam". This synthetic demo supports Alex Morgan only.

**Representative recovery**

> This demo fixture supports Alex Morgan only. I can run the offboarding review for
> Alex Morgan, or explain the tool contract without executing it.

**Second failure**

`stage_access_changes({"subject":"Alex Morgan","acknowledgeNoRevocation":false})`

**Expected tool error**

> acknowledgeNoRevocation must be true. WebMCP can stage this review but cannot
> confirm it.

**Representative recovery**

> I will acknowledge the staging-only boundary, then retry. Confirmation remains a
> separate visible normal page control outside the WebMCP tool surface.

## Final approval dialogue

**Agent before click**

> Review `alex-offboarding-2026-09-02` is staged with 5 removals, 1 reassigned
> dependency, and no durable mutation. No WebMCP tool confirms or revokes it. Please
> inspect the visible plan and activate **Confirm staged review** through an allowed
> browser interaction if it is correct; Codex/browser safety confirmation still
> applies.

**Human**

> I reviewed the page and clicked Confirm staged review. Read the receipt.

**Expected tool**

`get_access_review_receipt({"reviewId":"alex-offboarding-2026-09-02"})`

**Representative agent response**

> Receipt `ARR-2026-0902-0042` is confirmed for Alex Morgan by Jordan Lee. The mocked
> review records 5 removed grants and 1 rollback dependency preserved through
> `svc-oncall-relay`. A current access read now reports 0 sensitive grants for Alex,
> 1 service-owned rollback grant, and no remaining access risks.
