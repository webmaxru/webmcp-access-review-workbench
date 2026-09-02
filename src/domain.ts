export type ReviewPhase =
  | "idle"
  | "identity"
  | "access"
  | "paths"
  | "risks"
  | "simulated"
  | "revised"
  | "staged"
  | "confirmed";

export type PathKind =
  | "direct_role"
  | "nested_group"
  | "api_token"
  | "project_membership"
  | "service_identity";

export type CapabilityGrant = {
  id: string;
  capability: string;
  label: string;
  application: string;
  requiredByOnCall: boolean;
};

export type AccessPath = {
  id: string;
  kind: PathKind;
  title: string;
  explanation: string;
  ownerId: string;
  ownerLabel: string;
  nodes: string[];
  grants: CapabilityGrant[];
};

export type ReviewAction = {
  id: string;
  source: string;
  action: string;
  grantIds: string[];
};

export type Simulation = {
  mode: "remove_all" | "preserve_oncall";
  basisVersion: number;
  planHash: string;
  beforeScore: number;
  afterScore: number;
  removedGrantIds: string[];
  preservedGrantIds: string[];
  warnings: string[];
  actions: ReviewAction[];
};

export type StagedPlan = Simulation & {
  reviewId: string;
  stagedAt: string;
};

export type ReviewReceipt = {
  id: string;
  confirmedAt: string;
  reviewer: string;
  subject: string;
  planHash: string;
  removedGrantIds: string[];
  preservedGrantIds: string[];
  preservedOwner: string;
  finalSubjectGrantCount: number;
  summary: string;
};

export type TimelineEntry = {
  id: string;
  label: string;
  detail: string;
  tone: "neutral" | "danger" | "warning" | "success";
};

export type GrantOwners = Record<string, string | null>;

export type ReviewSnapshot = {
  phase: ReviewPhase;
  accessVersion: number;
  selectedPathId: string | null;
  paths: AccessPath[];
  risks: string[];
  simulation: Simulation | null;
  stagedPlan: StagedPlan | null;
  receipt: ReviewReceipt | null;
  timeline: TimelineEntry[];
  durableRevocations: string[];
  grantOwners: GrantOwners;
  webMcp: {
    status: "checking" | "ready" | "unavailable" | "error";
    registered: number;
    message: string;
  };
};

type Listener = () => void;
type MembershipGraph = Record<string, string[]>;

const SUBJECT = "Alex Morgan";
const SERVICE_IDENTITY = "svc-oncall-relay";
const REVIEW_ID = "alex-offboarding-2026-09-02";

const users = [
  SUBJECT,
  ...Array.from(
    { length: 49 },
    (_, index) => `Synthetic User ${String(index + 1).padStart(2, "0")}`,
  ),
];

const groups = [
  "Contractors",
  "Platform Contributors",
  "Release Observers",
  "SRE On-call",
  "Data Operations",
  "Finance",
  "Support",
  "Product",
  "Security",
  "Everyone",
];

const applications = ["Atlas Deploy", "Customer Vault", "Orbit Projects"];

export const membershipGraph: MembershipGraph = {
  [SUBJECT]: ["Contractors"],
  Contractors: ["Platform Contributors"],
  "Platform Contributors": ["Release Observers", "Release Manager"],
  "Release Observers": ["Contractors"],
  "Release Manager": ["Atlas Deploy"],
};

export const organizationFixture = {
  name: "Least-Privilege Access Review Workbench",
  users,
  groups,
  applications,
  subject: {
    id: "usr_alex_morgan",
    name: SUBJECT,
    email: "alex.morgan@least-privilege-access-review.example",
    status: "contract_ended",
    contractEnded: "2026-08-28",
    manager: "Priya Shah",
    department: "Platform Engineering",
  },
};

const grants: Record<string, CapabilityGrant> = {
  grant_prod_deploy_direct: {
    id: "grant_prod_deploy_direct",
    capability: "production.deploy",
    label: "Deploy to production",
    application: "Atlas Deploy",
    requiredByOnCall: false,
  },
  grant_prod_rollback_shared: {
    id: "grant_prod_rollback_shared",
    capability: "production.rollback",
    label: "Rollback production",
    application: "Atlas Deploy",
    requiredByOnCall: true,
  },
  grant_prod_deploy_group: {
    id: "grant_prod_deploy_group",
    capability: "production.deploy",
    label: "Deploy to production",
    application: "Atlas Deploy",
    requiredByOnCall: false,
  },
  grant_prod_approve_group: {
    id: "grant_prod_approve_group",
    capability: "production.approve",
    label: "Approve production release",
    application: "Atlas Deploy",
    requiredByOnCall: false,
  },
  grant_customer_export_token: {
    id: "grant_customer_export_token",
    capability: "customer_data.export",
    label: "Export customer data",
    application: "Customer Vault",
    requiredByOnCall: false,
  },
  grant_customer_export_project: {
    id: "grant_customer_export_project",
    capability: "customer_data.export",
    label: "Export customer data",
    application: "Customer Vault",
    requiredByOnCall: false,
  },
};

export function createInitialGrantOwners(): GrantOwners {
  return Object.fromEntries(Object.keys(grants).map((grantId) => [grantId, SUBJECT]));
}

const subjectPathTemplates: Omit<AccessPath, "grants">[] = [
  {
    id: "path_direct_role",
    kind: "direct_role",
    title: "Direct production role",
    explanation: "Alex directly holds Production Operator in Atlas Deploy.",
    ownerId: SUBJECT,
    ownerLabel: SUBJECT,
    nodes: [SUBJECT, "Production Operator", "Atlas Deploy"],
  },
  {
    id: "path_api_token",
    kind: "api_token",
    title: "Personal API token",
    explanation:
      "The active token am-ci-export is owned by Alex and can export customer records.",
    ownerId: SUBJECT,
    ownerLabel: SUBJECT,
    nodes: [SUBJECT, "am-ci-export", "Customer Vault"],
  },
  {
    id: "path_project_membership",
    kind: "project_membership",
    title: "Inherited project membership",
    explanation:
      "Orbit project Mercury inherits Data Steward access into Customer Vault.",
    ownerId: SUBJECT,
    ownerLabel: SUBJECT,
    nodes: [SUBJECT, "Mercury Project", "Data Steward", "Customer Vault"],
  },
];

const pathGrantIds: Record<string, string[]> = {
  path_direct_role: ["grant_prod_deploy_direct", "grant_prod_rollback_shared"],
  path_nested_group: ["grant_prod_deploy_group", "grant_prod_approve_group"],
  path_api_token: ["grant_customer_export_token"],
  path_project_membership: ["grant_customer_export_project"],
};

export function traverseMemberships(
  start: string,
  adjacency: MembershipGraph = membershipGraph,
) {
  const visited = new Set<string>();
  const active = new Set<string>();
  const reached: string[] = [];
  const cycles: string[][] = [];

  const visit = (node: string, trail: string[]) => {
    if (active.has(node)) {
      cycles.push([...trail, node]);
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    active.add(node);
    reached.push(node);
    for (const next of adjacency[node] ?? []) visit(next, [...trail, node]);
    active.delete(node);
  };

  visit(start, []);
  return { reached, cycles };
}

function findMembershipPath(
  start: string,
  target: string,
  adjacency: MembershipGraph,
) {
  const active = new Set<string>();

  const visit = (node: string, trail: string[]): string[] | null => {
    if (active.has(node)) return null;
    const nextTrail = [...trail, node];
    if (node === target) return nextTrail;
    active.add(node);
    for (const next of adjacency[node] ?? []) {
      const found = visit(next, nextTrail);
      if (found) {
        active.delete(node);
        return found;
      }
    }
    active.delete(node);
    return null;
  };

  return visit(start, []);
}

function cloneGrant(grantId: string) {
  return { ...grants[grantId] };
}

function createSubjectPath(
  template: Omit<AccessPath, "grants">,
  owners: GrantOwners,
) {
  const ownedGrants = (pathGrantIds[template.id] ?? [])
    .filter((grantId) => owners[grantId] === SUBJECT)
    .map(cloneGrant);
  return ownedGrants.length
    ? { ...template, nodes: [...template.nodes], grants: ownedGrants }
    : null;
}

export function getAccessPaths(
  adjacency: MembershipGraph = membershipGraph,
  owners: GrantOwners = createInitialGrantOwners(),
) {
  const paths = subjectPathTemplates
    .map((template) => createSubjectPath(template, owners))
    .filter((path): path is AccessPath => path !== null);

  const traversal = traverseMemberships(SUBJECT, adjacency);
  const nestedNodes = findMembershipPath(SUBJECT, "Atlas Deploy", adjacency);
  const nestedGrantIds = pathGrantIds.path_nested_group.filter(
    (grantId) => owners[grantId] === SUBJECT,
  );
  if (
    nestedNodes?.includes("Contractors") &&
    nestedNodes.includes("Platform Contributors") &&
    nestedNodes.includes("Release Manager") &&
    nestedGrantIds.length
  ) {
    paths.splice(1, 0, {
      id: "path_nested_group",
      kind: "nested_group",
      title: "Nested contractor group",
      explanation: traversal.cycles.length
        ? "Contractors nests into Platform Contributors, which grants Release Manager. A group cycle is detected and ignored."
        : "Contractors nests into Platform Contributors, which grants Release Manager.",
      ownerId: SUBJECT,
      ownerLabel: SUBJECT,
      nodes: nestedNodes,
      grants: nestedGrantIds.map(cloneGrant),
    });
  }

  if (owners.grant_prod_rollback_shared === SERVICE_IDENTITY) {
    paths.push({
      id: "path_service_rollback",
      kind: "service_identity",
      title: "On-call service dependency",
      explanation:
        "Production rollback is now owned by svc-oncall-relay instead of Alex Morgan.",
      ownerId: SERVICE_IDENTITY,
      ownerLabel: SERVICE_IDENTITY,
      nodes: [SERVICE_IDENTITY, "Production rollback", "Atlas Deploy"],
      grants: [cloneGrant("grant_prod_rollback_shared")],
    });
  }

  return paths;
}

function subjectPaths(paths: AccessPath[]) {
  return paths.filter((path) => path.ownerId === SUBJECT);
}

function servicePaths(paths: AccessPath[]) {
  return paths.filter((path) => path.ownerId === SERVICE_IDENTITY);
}

function planHash(
  mode: Simulation["mode"],
  basisVersion: number,
  removed: string[],
  preserved: string[],
  currentPaths: AccessPath[],
  actions: ReviewAction[],
) {
  const canonicalBasis = JSON.stringify({
    basisVersion,
    mode,
    removed: [...removed].sort(),
    preserved: [...preserved].sort(),
    topology: [...currentPaths]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((path) => ({
        id: path.id,
        ownerId: path.ownerId,
        nodes: [...path.nodes],
        grants: path.grants.map((grant) => grant.id).sort(),
      })),
    actions: [...actions]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((action) => ({
        id: action.id,
        source: action.source,
        action: action.action,
        grants: [...action.grantIds].sort(),
      })),
  });
  let hash = 0x811c9dc5;
  for (let index = 0; index < canonicalBasis.length; index += 1) {
    hash ^= canonicalBasis.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `plan-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function createSimulation(
  mode: Simulation["mode"],
  currentPaths: AccessPath[] = getAccessPaths(),
  basisVersion = 1,
): Simulation {
  const allGrants = subjectPaths(currentPaths).flatMap((path) => path.grants);
  const preserved =
    mode === "preserve_oncall"
      ? allGrants.filter((grant) => grant.requiredByOnCall).map((grant) => grant.id)
      : [];
  const removed = allGrants
    .filter((grant) => !preserved.includes(grant.id))
    .map((grant) => grant.id);
  const activeGrantIds = new Set(allGrants.map((grant) => grant.id));
  const hasRollbackDependency = activeGrantIds.has("grant_prod_rollback_shared");

  const actions: ReviewAction[] = [
    {
      id: "action_remove_direct",
      source: "Production Operator",
      action: "Remove Alex's direct role",
      grantIds: ["grant_prod_deploy_direct", "grant_prod_rollback_shared"],
    },
    {
      id: "action_remove_group",
      source: "Contractors",
      action: "Remove Alex from the nested contractor group",
      grantIds: ["grant_prod_deploy_group", "grant_prod_approve_group"],
    },
    {
      id: "action_disable_token",
      source: "am-ci-export",
      action: "Disable Alex's personal API token",
      grantIds: ["grant_customer_export_token"],
    },
    {
      id: "action_remove_project",
      source: "Mercury Project",
      action: "Remove inherited project membership",
      grantIds: ["grant_customer_export_project"],
    },
  ]
    .map((action) => ({
      ...action,
      grantIds: action.grantIds.filter((grantId) => activeGrantIds.has(grantId)),
    }))
    .filter((action) => action.grantIds.length);

  if (mode === "preserve_oncall" && hasRollbackDependency) {
    actions.push({
      id: "action_reassign_oncall",
      source: "Incident Relay",
      action: "Reassign rollback to svc-oncall-relay",
      grantIds: ["grant_prod_rollback_shared"],
    });
  }

  return {
    mode,
    basisVersion,
    planHash: planHash(
      mode,
      basisVersion,
      removed,
      preserved,
      currentPaths,
      actions,
    ),
    beforeScore: allGrants.length ? 92 : 18,
    afterScore: allGrants.length ? (mode === "preserve_oncall" ? 18 : 8) : 18,
    removedGrantIds: removed,
    preservedGrantIds: preserved,
    warnings:
      mode === "remove_all" && hasRollbackDependency
        ? [
            "Breakage: Incident Relay uses Alex's Production Operator rollback grant during the on-call handoff.",
          ]
        : [],
    actions,
  };
}

function findRisksFor(paths: AccessPath[]) {
  const alexPaths = subjectPaths(paths);
  const grantIds = new Set(alexPaths.flatMap((path) => path.grants.map((grant) => grant.id)));
  if (!grantIds.size) return [];

  const risks = ["Contract ended but privileged access remains active"];
  if (grantIds.has("grant_customer_export_token")) {
    risks.push("Personal token can export customer records");
  }
  if (alexPaths.some((path) => path.kind === "nested_group")) {
    risks.push("Nested group creates non-obvious production access");
  }
  if (grantIds.has("grant_prod_rollback_shared")) {
    risks.push("Shared rollback dependency is tied to a former contractor");
  }
  return risks;
}

function quantity(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function initialTimeline(): TimelineEntry[] {
  return [
    {
      id: "case_opened",
      label: "Offboarding signal received",
      detail: "Contract ended Friday · source: synthetic HRIS",
      tone: "neutral",
    },
  ];
}

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

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (
    value === null ||
    (typeof value !== "object" && typeof value !== "function")
  ) {
    return value;
  }
  const object = value as object;
  if (seen.has(object)) return value;
  seen.add(object);
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child, seen);
  }
  return Object.freeze(value);
}

export class AccessReviewService {
  private readonly adjacency: MembershipGraph;
  private listeners = new Set<Listener>();
  private snapshot: ReviewSnapshot;

  constructor(options: { membershipGraph?: MembershipGraph } = {}) {
    this.adjacency = options.membershipGraph ?? membershipGraph;
    this.snapshot = this.createInitialSnapshot();
  }

  private createInitialSnapshot(webMcp?: ReviewSnapshot["webMcp"]): ReviewSnapshot {
    return deepFreeze({
      phase: "idle",
      accessVersion: 1,
      selectedPathId: null,
      paths: [],
      risks: [],
      simulation: null,
      stagedPlan: null,
      receipt: null,
      timeline: initialTimeline(),
      durableRevocations: [],
      grantOwners: createInitialGrantOwners(),
      webMcp: webMcp ?? {
        status: "checking",
        registered: 0,
        message: "Checking top-level browser support…",
      },
    });
  }

  getSnapshot = () => this.snapshot;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private update(patch: Partial<ReviewSnapshot>, timeline?: TimelineEntry) {
    this.snapshot = deepFreeze({
      ...this.snapshot,
      ...patch,
      timeline: timeline
        ? [...this.snapshot.timeline.filter((entry) => entry.id !== timeline.id), timeline]
        : this.snapshot.timeline,
    });
    this.listeners.forEach((listener) => listener());
  }

  private advancePhase(target: ReviewPhase) {
    return phaseOrder.indexOf(this.snapshot.phase) > phaseOrder.indexOf(target)
      ? this.snapshot.phase
      : target;
  }

  private currentPaths(owners = this.snapshot.grantOwners) {
    return getAccessPaths(this.adjacency, owners);
  }

  private invalidateAnalysis(detail: string) {
    const hadStagedPlan = Boolean(this.snapshot.stagedPlan);
    this.update(
      { stagedPlan: null, simulation: null, phase: "revised" },
      {
        id: hadStagedPlan ? "stage_invalidated" : "simulation_invalidated",
        label: hadStagedPlan
          ? "Staged plan invalidated"
          : "Simulation invalidated",
        detail,
        tone: "warning",
      },
    );
  }

  private invalidateAnalysisIfAccessChanged(currentPaths: AccessPath[]) {
    if (this.snapshot.receipt) return false;
    const basis = this.snapshot.stagedPlan ?? this.snapshot.simulation;
    if (
      !basis ||
      basis.planHash ===
        createSimulation(basis.mode, currentPaths, this.snapshot.accessVersion).planHash
    ) {
      return false;
    }
    this.invalidateAnalysis(
      "Current effective access changed; recompute the displayed analysis before previewing or staging",
    );
    return true;
  }

  private ensureNotConfirmed(action: string) {
    if (this.snapshot.receipt) {
      throw new Error(
        `Review is already confirmed; ${action} cannot replace the confirmed result. Inspect current access or the receipt instead.`,
      );
    }
  }

  setWebMcpStatus(
    status: ReviewSnapshot["webMcp"]["status"],
    registered: number,
    message: string,
  ) {
    this.update({ webMcp: { status, registered, message } });
  }

  resolveIdentity() {
    this.update(
      { phase: this.advancePhase("identity") },
      {
        id: this.snapshot.receipt ? "identity_final" : "identity",
        label: "Identity resolved",
        detail: this.snapshot.receipt
          ? "Alex Morgan · confirmed review · current ownership retained"
          : "Alex Morgan · contractor · ended 28 Aug 2026",
        tone: "success",
      },
    );
    return {
      ...organizationFixture.subject,
      reviewStatus: this.snapshot.receipt ? "confirmed" : "open",
    };
  }

  computeEffectiveAccess() {
    const relevantPaths = this.currentPaths();
    this.invalidateAnalysisIfAccessChanged(relevantPaths);
    const alexPaths = subjectPaths(relevantPaths);
    const dependencies = servicePaths(relevantPaths);
    const capabilityGrantCount = alexPaths.flatMap((path) => path.grants).length;
    const dependencyGrantCount = dependencies.flatMap((path) => path.grants).length;
    this.update(
      {
        phase: this.advancePhase("access"),
        paths: relevantPaths,
        selectedPathId:
          relevantPaths.find((path) => path.id === this.snapshot.selectedPathId)?.id ??
          relevantPaths[0]?.id ??
          null,
      },
      {
        id: this.snapshot.receipt ? "access_final" : "access",
        label: this.snapshot.receipt
          ? "Final ownership inspected"
          : "Effective access computed",
        detail: this.snapshot.receipt
          ? `${alexPaths.length} Alex paths · ${capabilityGrantCount} Alex grants · ${dependencyGrantCount} service-owned rollback grant`
          : `${alexPaths.length} paths · ${capabilityGrantCount} sensitive capability grants`,
        tone: capabilityGrantCount ? "danger" : "success",
      },
    );
    return {
      pathCount: alexPaths.length,
      capabilityGrantCount,
      paths: alexPaths,
      preservedDependencies: dependencies,
      preservedDependencyCount: dependencyGrantCount,
      accessVersion: this.snapshot.accessVersion,
      reviewStatus: this.snapshot.receipt ? "confirmed" : "open",
    };
  }

  tracePath(pathId?: string) {
    const available = this.currentPaths();
    this.invalidateAnalysisIfAccessChanged(available);
    const selected = pathId
      ? available.find((path) => path.id === pathId)
      : available[0];
    if (!selected) {
      throw new Error(
        pathId
          ? `Path "${pathId}" is not present in the current ownership state.`
          : "No current sensitive access path is available to trace.",
      );
    }
    this.update(
      {
        phase: this.advancePhase("paths"),
        paths: available,
        selectedPathId: selected.id,
      },
      {
        id: this.snapshot.receipt ? "paths_final" : "paths",
        label: this.snapshot.receipt
          ? "Final ownership path traced"
          : "Permission paths traced",
        detail: this.snapshot.receipt
          ? "Rollback is owned by svc-oncall-relay; Alex has no sensitive path"
          : "Direct, nested group, token, and inherited project paths",
        tone: this.snapshot.receipt ? "success" : "danger",
      },
    );
    return selected;
  }

  findRisks() {
    const current = this.currentPaths();
    this.invalidateAnalysisIfAccessChanged(current);
    const risks = findRisksFor(current);
    this.update(
      {
        phase: this.advancePhase("risks"),
        paths: current,
        risks,
        selectedPathId:
          current.find((path) => path.id === this.snapshot.selectedPathId)?.id ??
          current[0]?.id ??
          null,
      },
      {
        id: this.snapshot.receipt ? "risks_final" : "risks",
        label: this.snapshot.receipt
          ? "Final risk state inspected"
          : "Least-privilege risks flagged",
        detail: this.snapshot.receipt
          ? "0 Alex access risks · rollback owned by svc-oncall-relay"
          : `${risks.length} findings · 1 shared-service dependency`,
        tone: risks.length ? "warning" : "success",
      },
    );
    return risks;
  }

  simulate(mode: Simulation["mode"] = "remove_all") {
    this.ensureNotConfirmed("a new simulation");
    const simulation = createSimulation(
      mode,
      this.currentPaths(),
      this.snapshot.accessVersion,
    );
    const stagedPlan =
      this.snapshot.stagedPlan?.planHash === simulation.planHash
        ? this.snapshot.stagedPlan
        : null;
    const invalidated = Boolean(this.snapshot.stagedPlan && !stagedPlan);
    this.update(
      {
        phase: stagedPlan
          ? "staged"
          : mode === "preserve_oncall"
            ? "revised"
            : "simulated",
        paths: this.currentPaths(),
        simulation,
        stagedPlan,
      },
      {
        id: mode === "preserve_oncall" ? "revised" : "simulation",
        label: mode === "preserve_oncall" ? "Dependency preserved" : "Removal simulated",
        detail:
          mode === "preserve_oncall"
            ? `${quantity(simulation.removedGrantIds.length, "unnecessary grant")} removed · ${quantity(simulation.preservedGrantIds.length, "rollback grant")} proposed for reassignment`
            : "Breakage detected before any durable change",
        tone: mode === "preserve_oncall" ? "success" : "warning",
      },
    );
    if (invalidated) {
      this.update(
        {},
        {
          id: "stage_invalidated",
          label: "Staged plan invalidated",
          detail: "Displayed simulation changed; stage again before confirmation",
          tone: "warning",
        },
      );
    }
    return simulation;
  }

  previewDelta() {
    if (this.snapshot.receipt) {
      return {
        status: "confirmed",
        before: 92,
        after: 18,
        removed: this.snapshot.receipt.removedGrantIds.length,
        preserved: this.snapshot.receipt.preservedGrantIds.length,
        durableMutation: true,
        finalSubjectGrantCount: 0,
        preservedOwner: this.snapshot.receipt.preservedOwner,
      };
    }
    this.invalidateAnalysisIfAccessChanged(this.currentPaths());
    const simulation = this.snapshot.simulation ?? this.simulate("preserve_oncall");
    return {
      status: "simulated",
      before: simulation.beforeScore,
      after: simulation.afterScore,
      removed: simulation.removedGrantIds.length,
      preserved: simulation.preservedGrantIds.length,
      durableMutation: false,
      planHash: simulation.planHash,
    };
  }

  stagePlan() {
    this.ensureNotConfirmed("staging");
    const simulation =
      this.snapshot.simulation?.mode === "preserve_oncall"
        ? this.snapshot.simulation
        : this.simulate("preserve_oncall");
    const currentSimulation = createSimulation(
      "preserve_oncall",
      this.currentPaths(),
      this.snapshot.accessVersion,
    );
    if (
      simulation.basisVersion !== this.snapshot.accessVersion ||
      simulation.planHash !== currentSimulation.planHash
    ) {
      this.update({ simulation: currentSimulation, stagedPlan: null, phase: "revised" });
      throw new Error("The simulation is stale. Recompute it before staging.");
    }
    const stagedPlan: StagedPlan = {
      ...simulation,
      reviewId: REVIEW_ID,
      stagedAt: "2026-09-02T08:41:00+02:00",
    };
    this.update(
      { phase: "staged", stagedPlan },
      {
        id: "staged",
        label: "Review staged",
        detail: "Visible confirmation control is ready · nothing revoked",
        tone: "success",
      },
    );
    return {
      status: "staged",
      reviewId: REVIEW_ID,
      planHash: stagedPlan.planHash,
      removedGrantCount: stagedPlan.removedGrantIds.length,
      preservedDependencyCount: stagedPlan.preservedGrantIds.length,
      durableMutation: false,
      nextStep:
        "Use the visible normal page confirmation control. It is not exposed as a WebMCP tool and remains subject to browser or agent-host safety confirmation.",
    };
  }

  cancelStage() {
    this.ensureNotConfirmed("stage cancellation");
    if (!this.snapshot.stagedPlan) {
      throw new Error("No staged review is available to cancel.");
    }
    this.update(
      { phase: "revised", stagedPlan: null },
      {
        id: "cancelled",
        label: "Staged review cancelled",
        detail: "No access changes were committed",
        tone: "neutral",
      },
    );
    return { status: "cancelled", durableMutation: false };
  }

  confirmStage(reviewer = "Jordan Lee") {
    this.ensureNotConfirmed("confirmation");
    const currentPaths = this.currentPaths();
    if (this.invalidateAnalysisIfAccessChanged(currentPaths)) {
      throw new Error(
        "The staged plan is stale because current effective access changed. Recompute and stage the current plan again.",
      );
    }
    const plan = this.snapshot.stagedPlan;
    if (!plan) {
      throw new Error("No staged review is available for confirmation.");
    }
    if (
      plan.basisVersion !== this.snapshot.accessVersion ||
      plan.planHash !== this.snapshot.simulation?.planHash ||
      plan.planHash !==
        createSimulation(
          plan.mode,
          currentPaths,
          this.snapshot.accessVersion,
        ).planHash
    ) {
      this.invalidateAnalysis(
        "The displayed simulation no longer matches the staged plan; recompute and stage again",
      );
      throw new Error(
        "The staged plan is stale because the displayed analysis changed. Recompute and stage the current plan again.",
      );
    }

    const grantOwners = { ...this.snapshot.grantOwners };
    for (const grantId of plan.removedGrantIds) grantOwners[grantId] = null;
    for (const grantId of plan.preservedGrantIds) grantOwners[grantId] = SERVICE_IDENTITY;
    const finalPaths = this.currentPaths(grantOwners);
    const finalSubjectGrantCount = subjectPaths(finalPaths).flatMap(
      (path) => path.grants,
    ).length;
    const receipt: ReviewReceipt = {
      id: "ARR-2026-0902-0042",
      confirmedAt: "2026-09-02T08:42:00+02:00",
      reviewer,
      subject: SUBJECT,
      planHash: plan.planHash,
      removedGrantIds: [...plan.removedGrantIds],
      preservedGrantIds: [...plan.preservedGrantIds],
      preservedOwner: SERVICE_IDENTITY,
      finalSubjectGrantCount,
      summary: `Mock review committed: Alex has ${quantity(finalSubjectGrantCount, "sensitive grant")}; ${quantity(plan.removedGrantIds.length, "grant")} removed; ${quantity(plan.preservedGrantIds.length, "dependency grant")} reassigned${plan.preservedGrantIds.length ? ` to ${SERVICE_IDENTITY}` : ""}.`,
    };
    this.update(
      {
        phase: "confirmed",
        accessVersion: this.snapshot.accessVersion + 1,
        receipt,
        durableRevocations: [...plan.removedGrantIds],
        grantOwners,
        paths: finalPaths,
        risks: [],
        stagedPlan: null,
        selectedPathId: finalPaths[0]?.id ?? null,
      },
      {
        id: "confirmed",
        label: "Visible confirmation recorded",
        detail: `${quantity(plan.removedGrantIds.length, "grant")} removed · ${quantity(plan.preservedGrantIds.length, "dependency")} reassigned · receipt created`,
        tone: "success",
      },
    );
    return { ...receipt };
  }

  getReceipt():
    | { status: "not_confirmed"; message: string }
    | { status: "confirmed"; receipt: ReviewReceipt } {
    if (!this.snapshot.receipt) {
      return {
        status: "not_confirmed",
        message:
          "No receipt exists until the visible normal page confirmation control is activated.",
      };
    }
    return {
      status: "confirmed",
      receipt: {
        ...this.snapshot.receipt,
        removedGrantIds: [...this.snapshot.receipt.removedGrantIds],
        preservedGrantIds: [...this.snapshot.receipt.preservedGrantIds],
      },
    };
  }

  selectPath(pathId: string) {
    if (!this.snapshot.paths.some((path) => path.id === pathId)) return;
    this.update({ selectedPathId: pathId });
  }

  reset() {
    this.snapshot = this.createInitialSnapshot(this.snapshot.webMcp);
    this.listeners.forEach((listener) => listener());
  }

  startRehearsal() {
    if (this.snapshot.receipt) {
      throw new Error(
        "Reset case before starting another rehearsal; confirmed ownership and its receipt cannot be erased implicitly.",
      );
    }
    this.reset();
    return this.resolveIdentity();
  }

  async runRehearsal(delay = 260) {
    this.startRehearsal();
    const pause = () => new Promise((resolve) => setTimeout(resolve, delay));
    this.computeEffectiveAccess();
    await pause();
    this.tracePath();
    await pause();
    this.findRisks();
    await pause();
    this.simulate("remove_all");
    await pause();
    this.simulate("preserve_oncall");
    await pause();
    return this.stagePlan();
  }
}
