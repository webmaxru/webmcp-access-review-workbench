# Demo storyboard — target 2:40

The product must visibly respond within the first 10–15 seconds. The final recording
must show real Codex Site Tool calls. The in-app step-through rehearsal is for
practice and fallback pacing only; it is not proof that WebMCP tools were discovered
or invoked.

For a practice take, click **Start step-through rehearsal**, then use the **Next**
button at each transition below. Each state holds indefinitely until continued.
After staging, the rehearsal stops and does not activate confirmation. After a
confirmed review, **Reset case** must be activated explicitly before rehearsal can
start again.

| Time | Final recording action | Step-through practice equivalent |
| --- | --- | --- |
| 0:00–0:10 | Show the headline prompt and Codex beginning Site Tool execution. | Start rehearsal; identity resolves and holds. |
| 0:10–0:26 | Show the nine-tool status plus the 50-user, 10-group, 3-app scope. | Hold the identity state. |
| 0:26–0:52 | Codex calls effective access and tracing; show four paths and six grants. | Advance through **compute effective access** and **trace permission paths**. |
| 0:52–1:13 | Focus the nested chain and cycle-safe explanation. | Hold the traced graph; select a path card if useful. |
| 1:13–1:30 | Codex calls risk analysis. | Advance to **flag access risks**. |
| 1:30–1:45 | Codex simulates full removal; show the Incident Relay warning. | Advance to **simulate full removal** and hold the warning. |
| 1:45–2:04 | Codex revises the plan; show future-state wording and 92 → 18. | Advance to **propose on-call reassignment**. |
| 2:04–2:18 | Codex stages; show 5 removals, 1 reassignment, and no receipt. | Advance to **stage the review**; rehearsal is now complete. |
| 2:18–2:30 | Activate the visible normal confirmation control. | This step is outside rehearsal and outside the WebMCP tool surface. |
| 2:30–2:40 | Codex reads the receipt and current access: Alex 0, service rollback 1. | Show the same confirmed final state after allowed browser activation. |

## Full voiceover transcript

Alex Morgan's contract ended Friday, but production deploy and customer-data export access remain active in this fully synthetic organization.

The Least-Privilege Access Review Workbench turns that question into a visible review, with every effective permission path explained.

I am asking Codex to investigate through the WebMCP Site Tools registered by this top-level page.

The status confirms nine imperative tools. This is real tool execution; the optional step-through rehearsal only holds the same states for practice.

The fixture contains exactly fifty synthetic users, ten groups, and three applications, with no credentials, secrets, or external APIs.

Codex resolves Alex's offboarding identity and computes four permission paths producing six sensitive capability grants.

The first path is a direct Production Operator role in Atlas Deploy.

The second runs through Contractors, Platform Contributors, and Release Manager, creating non-obvious production approval access.

The membership graph also cycles through Release Observers. Traversal detects that cycle and safely avoids double counting.

The other paths are Alex's personal am-ci-export token and inherited Data Steward access from the Mercury project.

Codex finds the risks and simulates removing all six grants. This simulation changes no permission.

It catches one breakage before staging: Incident Relay still depends on the production rollback capability attached to Alex's role.

Codex revises the plan by reassigning rollback to the dedicated service identity, svc-oncall-relay.

The deterministic result removes exactly five unnecessary grants from Alex and preserves exactly one shared on-call dependency.

Exposure moves from ninety-two to eighteen. Codex previews the delta and stages the review with zero changes before confirmation.

Before I approve, Codex reads the receipt state and correctly reports that no receipt exists.

Now I review the visible plan and activate Confirm staged review. This normal page control is not exposed as a WebMCP tool. Ordinary browser actuation may still reach it under Codex and browser safety confirmation. It commits only the mocked in-memory fixture. Codex reads receipt ARR-2026-0902-0042, then verifies that Alex has zero sensitive grants and rollback belongs to svc-oncall-relay. The Least-Privilege Access Review Workbench is not a production IAM or compliance system. It demonstrates a transparent review pattern with confirmation kept visible and subject to the browser safety workflow.
