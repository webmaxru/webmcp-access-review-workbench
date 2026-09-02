import { describe, expect, it } from "vitest";
import {
  AccessReviewService,
  createSimulation,
  getAccessPaths,
  membershipGraph,
  organizationFixture,
  traverseMemberships,
} from "./domain";

describe("deterministic access graph", () => {
  it("contains the promised synthetic organization scope", () => {
    expect(organizationFixture.users).toHaveLength(50);
    expect(organizationFixture.groups).toHaveLength(10);
    expect(organizationFixture.applications).toHaveLength(3);
  });

  it("finds nested memberships and terminates safely on cycles", () => {
    const result = traverseMemberships("A", {
      A: ["B"],
      B: ["C", "Role"],
      C: ["A"],
      Role: ["App"],
    });

    expect(result.reached).toEqual(["A", "B", "C", "Role", "App"]);
    expect(result.cycles).toHaveLength(1);
    expect(result.cycles[0]).toEqual(["A", "B", "C", "A"]);
  });

  it("produces exactly four paths and six sensitive capability grants", () => {
    const paths = getAccessPaths();
    expect(paths).toHaveLength(4);
    expect(paths.map((path) => path.kind)).toEqual([
      "direct_role",
      "nested_group",
      "api_token",
      "project_membership",
    ]);
    expect(paths.flatMap((path) => path.grants)).toHaveLength(6);
    expect(paths.find((path) => path.kind === "nested_group")?.nodes).toContain(
      "Platform Contributors",
    );
  });

  it("derives nested-group access from the cycle-safe membership graph", () => {
    const withoutReleaseManager = {
      ...membershipGraph,
      "Platform Contributors": ["Release Observers"],
    };
    const paths = getAccessPaths(withoutReleaseManager);

    expect(paths.map((path) => path.id)).not.toContain("path_nested_group");
    expect(paths).toHaveLength(3);
    expect(paths.flatMap((path) => path.grants)).toHaveLength(4);
  });

  it("revises the unsafe simulation to five removals and one preserved dependency", () => {
    const unsafe = createSimulation("remove_all");
    const safe = createSimulation("preserve_oncall");

    expect(unsafe.removedGrantIds).toHaveLength(6);
    expect(unsafe.preservedGrantIds).toHaveLength(0);
    expect(unsafe.warnings).toHaveLength(1);
    expect(safe.removedGrantIds).toHaveLength(5);
    expect(safe.preservedGrantIds).toEqual(["grant_prod_rollback_shared"]);
    expect(safe.warnings).toHaveLength(0);
  });
});

describe("visible confirmation boundary", () => {
  it("does not durably mutate access during simulation or staging", () => {
    const service = new AccessReviewService();
    service.resolveIdentity();
    service.computeEffectiveAccess();
    service.simulate("preserve_oncall");
    service.stagePlan();

    expect(service.getSnapshot().phase).toBe("staged");
    expect(service.getSnapshot().durableRevocations).toEqual([]);
    expect(service.getReceipt()).toMatchObject({ status: "not_confirmed" });
  });

  it("creates a receipt and updates current ownership after visible confirmation", () => {
    const service = new AccessReviewService();
    service.simulate("preserve_oncall");
    service.stagePlan();
    const receipt = service.confirmStage("Jordan Lee");
    const effective = service.computeEffectiveAccess();
    const risks = service.findRisks();

    expect(service.getSnapshot().durableRevocations).toHaveLength(5);
    expect(receipt.removedGrantIds).toHaveLength(5);
    expect(receipt.preservedGrantIds).toHaveLength(1);
    expect(receipt.finalSubjectGrantCount).toBe(0);
    expect(effective).toMatchObject({
      pathCount: 0,
      capabilityGrantCount: 0,
      preservedDependencyCount: 1,
      reviewStatus: "confirmed",
    });
    expect(effective.preservedDependencies[0]).toMatchObject({
      id: "path_service_rollback",
      ownerId: "svc-oncall-relay",
    });
    expect(risks).toEqual([]);
    expect(service.getSnapshot()).toMatchObject({
      phase: "confirmed",
      stagedPlan: null,
      risks: [],
      selectedPathId: "path_service_rollback",
    });
    expect(service.getSnapshot().paths).toHaveLength(1);
    expect(service.getSnapshot().grantOwners.grant_prod_rollback_shared).toBe(
      "svc-oncall-relay",
    );
    expect(service.getReceipt()).toEqual({ status: "confirmed", receipt });
  });

  it("protects stored receipt and snapshot data from external mutation", () => {
    const service = new AccessReviewService();
    service.simulate("preserve_oncall");
    service.stagePlan();
    const receipt = service.confirmStage();
    const snapshot = service.getSnapshot();

    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.receipt?.removedGrantIds)).toBe(true);
    expect(() => receipt.removedGrantIds.push("tampered_grant")).toThrow();
    expect(() =>
      snapshot.receipt?.preservedGrantIds.push("tampered_dependency"),
    ).toThrow();

    const returned = service.getReceipt();
    expect(returned.status).toBe("confirmed");
    if (returned.status === "confirmed") {
      returned.receipt.removedGrantIds.push("caller_only_mutation");
      returned.receipt.summary = "caller-only summary";
    }

    expect(service.getSnapshot().receipt?.removedGrantIds).toHaveLength(5);
    expect(service.getSnapshot().receipt?.summary).not.toBe("caller-only summary");
    expect(service.getSnapshot().durableRevocations).toHaveLength(5);
    expect(service.getSnapshot().receipt?.removedGrantIds).toEqual(
      service.getSnapshot().durableRevocations,
    );
  });

  it("invalidates a staged plan when a different simulation changes the display", () => {
    const service = new AccessReviewService();
    service.simulate("preserve_oncall");
    service.stagePlan();

    service.simulate("remove_all");

    expect(service.getSnapshot().stagedPlan).toBeNull();
    expect(service.getSnapshot().phase).toBe("simulated");
    expect(() => service.confirmStage()).toThrow(
      "No staged review is available for confirmation",
    );
  });

  it("keeps an unchanged staged plan valid across read-only analysis", () => {
    const service = new AccessReviewService();
    service.simulate("preserve_oncall");
    const staged = service.stagePlan();

    service.computeEffectiveAccess();
    service.findRisks();

    expect(service.getSnapshot().phase).toBe("staged");
    expect(service.getSnapshot().stagedPlan?.planHash).toBe(staged.planHash);
    expect(() => service.confirmStage()).not.toThrow();
  });

  it("rejects a staged plan if its effective-access basis changes out of order", () => {
    const mutableGraph = structuredClone(membershipGraph);
    const service = new AccessReviewService({ membershipGraph: mutableGraph });
    service.simulate("preserve_oncall");
    service.stagePlan();
    mutableGraph["Platform Contributors"] = ["Release Observers"];
    service.computeEffectiveAccess();

    expect(service.getSnapshot().stagedPlan).toBeNull();
    expect(service.getSnapshot().simulation).toBeNull();
    expect(() => service.confirmStage()).toThrow(
      "No staged review is available for confirmation",
    );
    expect(service.getSnapshot().durableRevocations).toEqual([]);
  });

  it("binds staged plans to path topology even when grant IDs stay identical", () => {
    const mutableGraph = structuredClone(membershipGraph);
    const service = new AccessReviewService({ membershipGraph: mutableGraph });
    service.simulate("preserve_oncall");
    const staged = service.stagePlan();

    mutableGraph.Contractors = ["Temporary Access Bridge"];
    mutableGraph["Temporary Access Bridge"] = ["Platform Contributors"];
    const effective = service.computeEffectiveAccess();

    expect(effective.capabilityGrantCount).toBe(6);
    expect(
      effective.paths.find((path) => path.id === "path_nested_group")?.nodes,
    ).toContain("Temporary Access Bridge");
    expect(service.getSnapshot().stagedPlan).toBeNull();
    expect(service.getSnapshot().simulation).toBeNull();
    const revised = service.simulate("preserve_oncall");
    expect(revised.planHash).not.toBe(staged.planHash);
  });

  it("invalidates an unstaged simulation before previewing changed topology", () => {
    const mutableGraph = structuredClone(membershipGraph);
    const service = new AccessReviewService({ membershipGraph: mutableGraph });
    const original = service.simulate("preserve_oncall");
    mutableGraph["Platform Contributors"] = ["Release Observers"];

    const preview = service.previewDelta();

    expect(preview).toMatchObject({
      status: "simulated",
      removed: 3,
      preserved: 1,
      durableMutation: false,
    });
    expect(preview.planHash).not.toBe(original.planHash);
    expect(service.getSnapshot().simulation?.planHash).toBe(preview.planHash);
    expect(service.getSnapshot().timeline).toContainEqual(
      expect.objectContaining({
        id: "simulation_invalidated",
        tone: "warning",
      }),
    );
  });

  it("fully invalidates direct stale confirmation and allows immediate restaging", () => {
    const mutableGraph = structuredClone(membershipGraph);
    const service = new AccessReviewService({ membershipGraph: mutableGraph });
    service.simulate("preserve_oncall");
    service.stagePlan();
    mutableGraph.Contractors = ["Temporary Access Bridge"];
    mutableGraph["Temporary Access Bridge"] = ["Platform Contributors"];

    expect(() => service.confirmStage()).toThrow(
      "current effective access changed",
    );
    expect(service.getSnapshot()).toMatchObject({
      phase: "revised",
      stagedPlan: null,
      simulation: null,
      durableRevocations: [],
    });
    expect(service.getSnapshot().timeline.at(-1)).toMatchObject({
      id: "stage_invalidated",
      tone: "warning",
    });

    service.simulate("preserve_oncall");
    service.stagePlan();
    expect(() => service.confirmStage()).not.toThrow();
    expect(service.getSnapshot().phase).toBe("confirmed");
  });

  it("derives receipt counts after topology-changed reanalysis and confirmation", () => {
    const mutableGraph = structuredClone(membershipGraph);
    const service = new AccessReviewService({ membershipGraph: mutableGraph });
    service.simulate("preserve_oncall");
    service.stagePlan();
    mutableGraph["Platform Contributors"] = ["Release Observers"];

    expect(() => service.confirmStage()).toThrow(
      "current effective access changed",
    );
    const revised = service.simulate("preserve_oncall");
    expect(revised.removedGrantIds).toHaveLength(3);
    expect(revised.preservedGrantIds).toHaveLength(1);
    service.stagePlan();
    const receipt = service.confirmStage();

    expect(receipt.removedGrantIds).toHaveLength(3);
    expect(receipt.preservedGrantIds).toHaveLength(1);
    expect(receipt.summary).toContain("3 grants removed");
    expect(receipt.summary).toContain("1 dependency grant reassigned");
    expect(service.getSnapshot().durableRevocations).toEqual(
      receipt.removedGrantIds,
    );
    expect(service.computeEffectiveAccess()).toMatchObject({
      pathCount: 0,
      capabilityGrantCount: 0,
      preservedDependencyCount: 1,
    });
  });

  it("prevents post-confirmation phase regression and plan replacement", () => {
    const service = new AccessReviewService();
    service.simulate("preserve_oncall");
    service.stagePlan();
    service.confirmStage();

    service.resolveIdentity();
    service.computeEffectiveAccess();
    service.tracePath();
    service.findRisks();

    expect(service.getSnapshot().phase).toBe("confirmed");
    expect(service.getSnapshot().stagedPlan).toBeNull();
    expect(service.getSnapshot().receipt?.id).toBe("ARR-2026-0902-0042");
    expect(() => service.simulate("remove_all")).toThrow("already confirmed");
    expect(() => service.stagePlan()).toThrow("already confirmed");
    expect(() => service.cancelStage()).toThrow("already confirmed");
    expect(service.getSnapshot().phase).toBe("confirmed");
  });

  it("requires an explicit reset before rehearsal can erase a confirmed case", async () => {
    const service = new AccessReviewService();
    service.simulate("preserve_oncall");
    service.stagePlan();
    const receipt = service.confirmStage();

    await expect(service.runRehearsal(0)).rejects.toThrow(
      "Reset case before starting another rehearsal",
    );
    expect(service.getSnapshot().receipt).toEqual(receipt);
    expect(service.getSnapshot().grantOwners.grant_prod_rollback_shared).toBe(
      "svc-oncall-relay",
    );

    service.reset();
    await expect(service.runRehearsal(0)).resolves.toMatchObject({
      status: "staged",
    });
  });
});
