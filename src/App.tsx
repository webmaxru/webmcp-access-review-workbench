import { useState, useSyncExternalStore } from "react";
import type {
  AccessPath,
  AccessReviewService,
  ReviewPhase,
  TimelineEntry,
} from "./domain";

const kindLabels: Record<AccessPath["kind"], string> = {
  direct_role: "Direct role",
  nested_group: "Nested group",
  api_token: "API token",
  project_membership: "Project inheritance",
  service_identity: "Service identity",
};

const phaseOrder: ReviewPhase[] = [
  "idle",
  "identity",
  "access",
  "paths",
  "risks",
  "simulated",
  "revised",
  "staged",
  "confirmed",
];

type ChangeCounts = {
  removed: number;
  preserved: number;
};

function countLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function getDependencyStatusCopy(
  confirmed: boolean,
  counts: ChangeCounts,
) {
  return confirmed
    ? {
        eyebrow: "FINAL OWNERSHIP VERIFIED",
        title: "svc-oncall-relay owns rollback",
        detail: `Alex now has 0 sensitive grants; ${countLabel(counts.removed, "grant")} ${counts.removed === 1 ? "was" : "were"} removed and the service owns ${countLabel(counts.preserved, "required rollback capability")}.`,
      }
    : {
        eyebrow: "PROPOSED DEPENDENCY REASSIGNMENT",
        title: "Rollback would move to svc-oncall-relay",
        detail: `The plan would remove ${countLabel(counts.removed, "grant")} from Alex and reassign ${countLabel(counts.preserved, "shared dependency", "shared dependencies")}.`,
      };
}

export function getScoreHeading(confirmed: boolean) {
  return confirmed ? "Original → current result" : "Before → proposed";
}

export function getAccessScopeCopy(
  paths: AccessPath[],
  analyzed: boolean,
  confirmed: boolean,
  counts: ChangeCounts,
) {
  const alexPaths = paths.filter((path) => path.ownerId === "Alex Morgan");
  const alexGrants = alexPaths.flatMap((path) => path.grants).length;
  const serviceGrants = paths
    .filter((path) => path.ownerId === "svc-oncall-relay")
    .flatMap((path) => path.grants).length;

  if (!analyzed) {
    return {
      heading: "Access paths awaiting analysis.",
      description: "No effective access topology has been computed yet.",
    };
  }
  if (confirmed) {
    return {
      heading: `Alex: ${alexGrants} sensitive grants. ${serviceGrants} service-owned rollback.`,
      description: `Alex has ${alexPaths.length} current sensitive paths. ${countLabel(counts.removed, "grant")} ${counts.removed === 1 ? "was" : "were"} removed and ${countLabel(serviceGrants, "rollback dependency", "rollback dependencies")} ${serviceGrants === 1 ? "is" : "are"} service-owned.`,
    };
  }
  return {
    heading: `${countLabel(alexPaths.length, "effective path")}. ${countLabel(alexGrants, "sensitive grant")}.`,
    description: `${countLabel(alexPaths.length, "current path")} connect Alex to ${countLabel(alexGrants, "sensitive capability grant")}.${counts.removed ? ` The proposed plan removes ${countLabel(counts.removed, "grant")} and reassigns ${countLabel(counts.preserved, "rollback dependency", "rollback dependencies")}.` : ""}`,
  };
}

export function getActiveGraphPathIds(paths: AccessPath[]) {
  return new Set(paths.map((path) => path.id));
}

function hasReached(current: ReviewPhase, target: ReviewPhase) {
  return phaseOrder.indexOf(current) >= phaseOrder.indexOf(target);
}

function ShieldMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 40 44" aria-hidden="true">
      <path d="M20 2 36 8v12c0 10.6-6.7 18-16 22C10.7 38 4 30.6 4 20V8L20 2Z" />
      <path d="m13 22 5 5 10-12" />
    </svg>
  );
}

function AccessGraph({
  phase,
  selectedPathId,
  paths,
  description,
}: {
  phase: ReviewPhase;
  selectedPathId: string | null;
  paths: AccessPath[];
  description: string;
}) {
  const visible = hasReached(phase, "access");
  const safe = hasReached(phase, "revised");
  const confirmed = phase === "confirmed";
  const activePathIds = getActiveGraphPathIds(paths);
  const servicePathActive = activePathIds.has("path_service_rollback");
  const edgeClass = (pathId: string, preserved = false) => {
    if (!visible) return "edge edge-muted";
    if (confirmed) {
      return preserved && servicePathActive ? "edge edge-safe" : "edge edge-hidden";
    }
    if (!activePathIds.has(pathId)) return "edge edge-hidden";
    if (safe && preserved) return "edge edge-safe";
    if (safe) return "edge edge-staged";
    return selectedPathId === pathId ? "edge edge-danger edge-active" : "edge edge-danger";
  };
  const nodeClass = (pathIds: string[], serviceNode = false) =>
    visible &&
    !pathIds.some((pathId) => activePathIds.has(pathId)) &&
    !(serviceNode && servicePathActive)
      ? " node-hidden"
      : "";

  return (
    <div className="graph-wrap">
      <svg
        className="access-graph"
        viewBox="0 0 760 390"
        role="img"
        aria-labelledby="graph-title graph-desc"
      >
        <title id="graph-title">Alex Morgan effective access graph</title>
        <desc id="graph-desc">{description}</desc>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>

        <g>
          <path className={edgeClass("path_direct_role")} d="M142 185 C220 110 250 72 342 68" />
          <path className={edgeClass("path_direct_role", true)} d="M430 68 C515 68 535 115 618 118" />
        </g>
        <g>
          <path className={edgeClass("path_nested_group")} d="M142 204 C220 208 250 160 342 158" />
          <path className={edgeClass("path_nested_group")} d="M430 158 C520 158 540 145 618 132" />
        </g>
        <g>
          <path className={edgeClass("path_api_token")} d="M142 220 C220 268 260 270 342 262" />
          <path className={edgeClass("path_api_token")} d="M430 262 C515 262 535 278 618 282" />
        </g>
        <g>
          <path className={edgeClass("path_project_membership")} d="M142 232 C220 335 265 350 342 344" />
          <path className={edgeClass("path_project_membership")} d="M430 344 C520 344 540 310 618 296" />
        </g>

        <g className="node node-person" transform="translate(42 166)">
          <rect width="100" height="78" rx="18" />
          <circle cx="28" cy="28" r="13" />
          <path d="M13 59c2-12 28-12 30 0" />
          <text x="51" y="29">Alex</text>
          <text x="51" y="47">Morgan</text>
          <text className="node-meta" x="51" y="63">ended</text>
        </g>

        <g className={`node node-source${nodeClass(["path_direct_role"], true)}`} transform="translate(342 38)">
          <rect width="112" height="58" rx="14" />
          <text x="56" y="25" textAnchor="middle">{confirmed ? "svc-oncall" : "Production"}</text>
          <text x="56" y="42" textAnchor="middle">{confirmed ? "relay" : "Operator"}</text>
        </g>
        <g className={`node node-source${nodeClass(["path_nested_group"])}`} transform="translate(330 128)">
          <rect width="136" height="58" rx="14" />
          <text x="68" y="25" textAnchor="middle">Nested groups</text>
          <text className="node-meta" x="68" y="43" textAnchor="middle">2 hops · cycle-safe</text>
        </g>
        <g className={`node node-source${nodeClass(["path_api_token"])}`} transform="translate(342 233)">
          <rect width="112" height="58" rx="14" />
          <text x="56" y="25" textAnchor="middle">API token</text>
          <text className="node-meta" x="56" y="43" textAnchor="middle">am-ci-export</text>
        </g>
        <g className={`node node-source${nodeClass(["path_project_membership"])}`} transform="translate(330 315)">
          <rect width="136" height="58" rx="14" />
          <text x="68" y="25" textAnchor="middle">Mercury project</text>
          <text className="node-meta" x="68" y="43" textAnchor="middle">inherited role</text>
        </g>

        <g className={`node node-target${nodeClass(["path_direct_role", "path_nested_group"], true)}`} transform="translate(618 82)">
          <rect width="116" height="78" rx="18" />
          <text x="58" y="27" textAnchor="middle">Atlas Deploy</text>
          <text className="node-meta" x="58" y="48" textAnchor="middle">
            {confirmed ? "Alex access removed" : "deploy · approve"}
          </text>
          <text className={safe ? "target-safe" : "target-risk"} x="58" y="65" textAnchor="middle">
            {confirmed ? "service-owned rollback" : "rollback"}
          </text>
        </g>
        <g className={`node node-target${nodeClass(["path_api_token", "path_project_membership"])}`} transform="translate(618 251)">
          <rect width="116" height="70" rx="18" />
          <text x="58" y="28" textAnchor="middle">Customer Vault</text>
          <text className="node-meta" x="58" y="50" textAnchor="middle">data export</text>
        </g>
      </svg>
      <div className="legend" aria-label="Graph legend">
        <span><i className="legend-dot red" />Excess access</span>
        <span><i className="legend-dot amber" />Staged removal</span>
        <span><i className="legend-dot green" />Reassigned dependency</span>
      </div>
    </div>
  );
}

function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="timeline">
      {entries.map((entry) => (
        <li key={entry.id} className={`timeline-item ${entry.tone}`}>
          <span className="timeline-dot" />
          <div>
            <strong>{entry.label}</strong>
            <p>{entry.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function App({ service }: { service: AccessReviewService }) {
  const state = useSyncExternalStore(service.subscribe, service.getSnapshot);
  const [rehearsalStep, setRehearsalStep] = useState<number | null>(null);
  const activePaths = state.paths;
  const simulation = state.simulation;
  const staged = state.stagedPlan;
  const confirmed = Boolean(state.receipt);
  const changeSource = state.receipt ?? staged ?? simulation;
  const changeCounts = {
    removed: changeSource?.removedGrantIds.length ?? 0,
    preserved: changeSource?.preservedGrantIds.length ?? 0,
  };
  const dependencyCopy = getDependencyStatusCopy(confirmed, changeCounts);
  const analyzed = confirmed || activePaths.length > 0 || hasReached(state.phase, "access");
  const accessScopeCopy = getAccessScopeCopy(
    activePaths,
    analyzed,
    confirmed,
    changeCounts,
  );

  const rehearsalSteps = [
    { label: "compute effective access", run: () => service.computeEffectiveAccess() },
    { label: "trace permission paths", run: () => service.tracePath() },
    { label: "flag access risks", run: () => service.findRisks() },
    { label: "simulate full removal", run: () => service.simulate("remove_all") },
    { label: "propose on-call reassignment", run: () => service.simulate("preserve_oncall") },
    { label: "stage the review", run: () => service.stagePlan() },
  ];
  const rehearsalComplete = rehearsalStep === rehearsalSteps.length;

  const advanceRehearsal = () => {
    if (confirmed || rehearsalComplete) return;
    if (rehearsalStep === null) {
      service.startRehearsal();
      setRehearsalStep(0);
      return;
    }
    rehearsalSteps[rehearsalStep].run();
    setRehearsalStep(rehearsalStep + 1);
  };

  const resetCase = () => {
    service.reset();
    setRehearsalStep(null);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#main">
          <ShieldMark />
          <span>
            <b>LEAST-PRIVILEGE</b>
            <small>ACCESS REVIEW WORKBENCH</small>
          </span>
        </a>
        <div className="topbar-actions">
          <span className={`webmcp-status ${state.webMcp.status}`} role="status">
            <i />
            WebMCP · {state.webMcp.message}
          </span>
          <button className="ghost-button" onClick={resetCase}>
            Reset case
          </button>
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="case-heading">
          <div className="hero-copy">
            <div className="eyebrow">
              <span>OFFBOARDING REVIEW</span>
              <span>CASE AR-042</span>
              <span className="priority">HIGH PRIORITY</span>
            </div>
            <h1 id="case-heading">Least privilege, with every path explained.</h1>
            <p className="prompt">
              “Alex Morgan&apos;s contract ended Friday. Find every path that still grants
              production deploy or customer-data export, preserve anything required by
              the on-call service, simulate the change, and stage the least-privilege
              review without revoking anything.”
            </p>
          </div>
          <div className="hero-action">
            <button
              className="rehearsal-button"
              onClick={advanceRehearsal}
              disabled={confirmed || rehearsalComplete}
            >
              <span className="play-icon">
                {rehearsalStep === null ? "▶" : rehearsalComplete ? "✓" : "→"}
              </span>
              <span>
                <b>
                  {confirmed
                    ? "Reset case to rehearse again"
                    : rehearsalStep === null
                      ? "Start step-through rehearsal"
                      : rehearsalComplete
                        ? "Rehearsal staged"
                        : `Next: ${rehearsalSteps[rehearsalStep].label}`}
                </b>
                <small>
                  {rehearsalStep === null
                    ? "Manual steps · not a WebMCP substitute"
                    : rehearsalComplete
                      ? "Complete · confirmation was not activated"
                      : `Step ${rehearsalStep + 2} of ${rehearsalSteps.length + 1} · holds until continued`}
                </small>
              </span>
            </button>
            <p>
              Uses the same domain service and holds each state for recording or
              inspection.
            </p>
          </div>
        </section>

        <section className="metric-strip" aria-label="Synthetic organization scope">
          <div><strong>50</strong><span>synthetic users</span></div>
          <div><strong>10</strong><span>groups</span></div>
          <div><strong>3</strong><span>applications</span></div>
          <div className="case-person">
            <span className="avatar">AM</span>
            <span><strong>Alex Morgan</strong><small>Contract ended · 28 Aug</small></span>
          </div>
        </section>

        <div className="workspace-grid">
          <section className="panel graph-panel" aria-labelledby="graph-heading">
            <div className="panel-header">
              <div>
                <span className="section-kicker">EFFECTIVE ACCESS MAP</span>
                <h2 id="graph-heading">{accessScopeCopy.heading}</h2>
              </div>
              <span className="freshness">Fixture snapshot · 08:40</span>
            </div>
            <AccessGraph
              phase={state.phase}
              selectedPathId={state.selectedPathId}
              paths={activePaths}
              description={accessScopeCopy.description}
            />
            <div className="path-grid">
              {(analyzed ? activePaths : [
                { id: "placeholder-1", kind: "direct_role", title: "Direct role" },
                { id: "placeholder-2", kind: "nested_group", title: "Nested group" },
                { id: "placeholder-3", kind: "api_token", title: "API token" },
                { id: "placeholder-4", kind: "project_membership", title: "Project inheritance" },
              ]).map((path) => {
                const fullPath = "grants" in path ? path : null;
                return (
                  <button
                    className={`path-card ${state.selectedPathId === path.id ? "selected" : ""} ${!fullPath ? "skeleton-card" : ""}`}
                    key={path.id}
                    onClick={() => fullPath && service.selectPath(fullPath.id)}
                    disabled={!fullPath}
                  >
                    <span className="path-number">
                      {fullPath ? String(activePaths.indexOf(fullPath) + 1).padStart(2, "0") : "—"}
                    </span>
                    <span>
                      <small>{kindLabels[path.kind as AccessPath["kind"]]}</small>
                      <b>{path.title}</b>
                      {fullPath && <em>{fullPath.grants.length} capability grant{fullPath.grants.length > 1 ? "s" : ""}</em>}
                    </span>
                  </button>
                );
              })}
            </div>
            {state.selectedPathId && (
              <div className="path-explanation" aria-live="polite">
                <span>WHY THIS COUNTS</span>
                <p>{activePaths.find((path) => path.id === state.selectedPathId)?.explanation}</p>
              </div>
            )}
          </section>

          <aside className="right-rail" aria-label="Review controls and results">
            <section className="panel score-card">
              <div className="panel-header compact">
                <div>
                  <span className="section-kicker">EXPOSURE SCORE</span>
                  <h2>{getScoreHeading(confirmed)}</h2>
                </div>
                <span className="score-status">
                  {confirmed ? "CONFIRMED" : simulation ? "SIMULATED" : "WAITING"}
                </span>
              </div>
              <div className="scores">
                <div className="score before">
                  <strong>{simulation?.beforeScore ?? 92}</strong>
                  <span>HIGH</span>
                </div>
                <div className="score-arrow">→</div>
                <div className="score after">
                  <strong>{simulation?.afterScore ?? "—"}</strong>
                  <span>{simulation ? "LOW" : "PENDING"}</span>
                </div>
              </div>
              <div className="score-bar"><i style={{ width: `${simulation ? simulation.afterScore : 92}%` }} /></div>
            </section>

            {simulation?.warnings.length ? (
              <section className="warning-card" aria-live="assertive">
                <div className="warning-icon">!</div>
                <div>
                  <span>BREAKAGE FOUND IN SIMULATION</span>
                  <h3>On-call rollback would fail</h3>
                  <p>{simulation.warnings[0]}</p>
                  <button onClick={() => service.simulate("preserve_oncall")}>
                    Reassign to service identity
                  </button>
                </div>
              </section>
            ) : simulation?.mode === "preserve_oncall" ? (
              <section className="success-card" aria-live="polite">
                <span className="success-check">✓</span>
                <div>
                  <span>{dependencyCopy.eyebrow}</span>
                  <h3>{dependencyCopy.title}</h3>
                  <p>{dependencyCopy.detail}</p>
                </div>
              </section>
            ) : (
              <section className="empty-callout">
                <span>SAFETY CHECK</span>
                <h3>No changes simulated yet</h3>
                <p>Run the rehearsal or invoke the WebMCP tools to reveal impact.</p>
              </section>
            )}

            <section className="panel activity-card">
              <div className="panel-header compact">
                <div>
                  <span className="section-kicker">ACTIVITY</span>
                  <h2>Review timeline</h2>
                </div>
                <span>{state.timeline.length} events</span>
              </div>
              <Timeline entries={state.timeline} />
            </section>
          </aside>
        </div>

        <section className={`staging-drawer ${staged || confirmed ? "open" : ""}`} aria-live="polite">
          <div className="staging-summary">
            <span className="section-kicker">
              {confirmed ? "CONFIRMED RESULT" : "STAGED PLAN"}
            </span>
            <h2>
              {confirmed
                ? "Mocked ownership state updated"
                : staged
                  ? "Ready for visible confirmation"
                  : "No access changes are staged"}
            </h2>
            <p>
              {confirmed
                ? "Alex has 0 sensitive grants. Rollback is now owned by svc-oncall-relay, matching the receipt and current access graph."
                : staged
                  ? "The plan is ready. Its normal page confirmation control is not exposed as a WebMCP tool and remains subject to browser or agent-host safety confirmation."
                  : "Inspection and simulation can run through WebMCP; the mocked ownership update uses the visible normal page control below."}
            </p>
          </div>
          <div className="delta-pills">
            <span className="remove-pill">
              − {staged?.removedGrantIds.length ?? state.receipt?.removedGrantIds.length ?? 0} removed
            </span>
            <span className="preserve-pill">
              ↪ {staged?.preservedGrantIds.length ?? state.receipt?.preservedGrantIds.length ?? 0} reassigned
            </span>
            <span className="mutation-pill">
              {confirmed ? "Current state matches receipt" : "0 changes before confirmation"}
            </span>
          </div>
          <div className="confirmation-actions">
            {state.receipt ? (
              <div className="receipt-mini">
                <span>READ-ONLY RECEIPT</span>
                <strong>{state.receipt.id}</strong>
                <small>{state.receipt.summary}</small>
              </div>
            ) : (
              <>
                <button
                  className="confirm-button"
                  disabled={!staged}
                  onClick={() => service.confirmStage()}
                >
                  Confirm staged review
                </button>
                <small>
                  Normal page control · not a WebMCP tool · host safety checks still apply
                </small>
              </>
            )}
          </div>
        </section>
      </main>

      <footer>
        <span>Synthetic demo data only · no live identities, tokens, or permission systems</span>
        <span>Least-Privilege Access Review Workbench · WebMCP Challenge 2026</span>
      </footer>
    </div>
  );
}
