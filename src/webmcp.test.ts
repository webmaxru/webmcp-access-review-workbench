import { describe, expect, it, vi } from "vitest";
import { AccessReviewService } from "./domain";
import {
  createAccessReviewTools,
  registerAccessReviewTools,
  resolveAccessReviewModelContext,
} from "./webmcp";

const liveSignal = () => new AbortController().signal;

describe("WebMCP tool contracts", () => {
  it("requires a secure visible window and prefers document.modelContext", () => {
    const documentContext = { registerTool: vi.fn() } as WebModelContext;
    const navigatorContext = { registerTool: vi.fn() } as WebModelContext;
    vi.stubGlobal("window", { isSecureContext: true });
    vi.stubGlobal("document", { modelContext: documentContext });
    vi.stubGlobal("navigator", { modelContext: navigatorContext });

    expect(resolveAccessReviewModelContext()).toBe(documentContext);

    vi.stubGlobal("window", { isSecureContext: false });
    expect(resolveAccessReviewModelContext()).toBeNull();
    vi.unstubAllGlobals();
  });

  it("registers nine top-level imperative tools with lifecycle cleanup", async () => {
    const registered: WebMcpTool[] = [];
    const signals: AbortSignal[] = [];
    const unregisterTool = vi.fn();
    const context: WebModelContext = {
      registerTool: vi.fn(async (tool, options) => {
        registered.push(tool);
        if (options?.signal) signals.push(options.signal);
      }),
      unregisterTool,
    };
    const service = new AccessReviewService();
    const registration = registerAccessReviewTools(service, context);

    await registration.ready;

    expect(registered.map((tool) => tool.name)).toEqual([
      "get_identity_context",
      "get_effective_access",
      "trace_permission_path",
      "find_access_risks",
      "simulate_access_changes",
      "preview_access_delta",
      "stage_access_changes",
      "cancel_staged_access_review",
      "get_access_review_receipt",
    ]);
    expect(
      registered.filter((tool) => tool.annotations?.readOnlyHint).map((tool) => tool.name),
    ).toEqual(["get_access_review_receipt"]);
    for (const tool of registered.filter(
      (candidate) => candidate.name !== "get_access_review_receipt",
    )) {
      expect(tool.annotations?.readOnlyHint).toBe(false);
    }
    expect(registered.every((tool) => tool.annotations?.untrustedContentHint === false)).toBe(true);
    expect(service.getSnapshot().webMcp).toMatchObject({ status: "ready", registered: 9 });

    registration.dispose();
    expect(unregisterTool).toHaveBeenCalledTimes(9);
    expect(signals.every((signal) => signal.aborted)).toBe(true);
  });

  it("keeps names unique and rolls back partial registration failures", async () => {
    const tools = createAccessReviewTools(new AccessReviewService());
    expect(new Set(tools.map((tool) => tool.name)).size).toBe(tools.length);

    const activeNames = new Set(["trace_permission_path"]);
    const signals: AbortSignal[] = [];
    const unregisterTool = vi.fn((name: string) => activeNames.delete(name));
    const context: WebModelContext = {
      registerTool: vi.fn((tool, options) => {
        if (options?.signal) signals.push(options.signal);
        if (activeNames.has(tool.name)) {
          throw new DOMException("Duplicate tool name", "InvalidStateError");
        }
        activeNames.add(tool.name);
        options?.signal.addEventListener(
          "abort",
          () => activeNames.delete(tool.name),
          { once: true },
        );
      }),
      unregisterTool,
    };
    const service = new AccessReviewService();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const registration = registerAccessReviewTools(service, context);

    await expect(registration.ready).resolves.toBeUndefined();
    expect(service.getSnapshot().webMcp).toMatchObject({
      status: "error",
      registered: 0,
    });
    expect(unregisterTool).toHaveBeenCalledTimes(8);
    expect(unregisterTool).not.toHaveBeenCalledWith("trace_permission_path");
    expect(activeNames).toEqual(new Set(["trace_permission_path"]));
    expect(signals.every((signal) => signal.aborted)).toBe(true);
    registration.dispose();
    expect(unregisterTool).toHaveBeenCalledTimes(8);
    consoleError.mockRestore();
  });

  it("cleans up immediately on the first async registration failure", async () => {
    const slowResolvers: Array<() => void> = [];
    const signals: AbortSignal[] = [];
    const unregisterTool = vi.fn();
    const context: WebModelContext = {
      registerTool: vi.fn((tool, options) => {
        if (options?.signal) signals.push(options.signal);
        if (tool.name === "get_identity_context") {
          return Promise.reject(new Error("first async failure"));
        }
        return new Promise<void>((resolve) => slowResolvers.push(resolve));
      }),
      unregisterTool,
    };
    const service = new AccessReviewService();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const registration = registerAccessReviewTools(service, context);

    await registration.ready;

    expect(context.registerTool).toHaveBeenCalledTimes(9);
    expect(unregisterTool).not.toHaveBeenCalled();
    expect(signals.every((signal) => signal.aborted)).toBe(true);
    expect(service.getSnapshot().webMcp).toMatchObject({
      status: "error",
      registered: 0,
    });

    slowResolvers.forEach((resolve) => resolve());
    await Promise.resolve();
    await Promise.resolve();
    expect(service.getSnapshot().webMcp.status).toBe("error");
    consoleError.mockRestore();
  });

  it("validates inputs in code instead of trusting schemas", async () => {
    const service = new AccessReviewService();
    const tools = createAccessReviewTools(service);
    const identity = tools.find((tool) => tool.name === "get_identity_context")!;
    const stage = tools.find((tool) => tool.name === "stage_access_changes")!;

    expect(() =>
      identity.execute({ subject: "Unknown User" }, { signal: liveSignal() }),
    ).toThrow("supports Alex Morgan only");
    expect(() =>
      stage.execute(
        { subject: "Alex Morgan", acknowledgeNoRevocation: false },
        { signal: liveSignal() },
      ),
    ).toThrow("acknowledgeNoRevocation must be true");
    expect(() =>
      identity.execute(
        { subject: "Alex Morgan", ignored: true },
        { signal: liveSignal() },
      ),
    ).toThrow("Unexpected input field: ignored");
    const trace = tools.find((tool) => tool.name === "trace_permission_path")!;
    expect(() =>
      trace.execute(
        { subject: "Alex Morgan", pathId: "path_typo" },
        { signal: liveSignal() },
      ),
    ).toThrow("pathId must be one of the documented path identifiers");
  });

  it("stages through WebMCP without exposing the visible confirmation control", async () => {
    const service = new AccessReviewService();
    const tools = createAccessReviewTools(service);
    const simulate = tools.find((tool) => tool.name === "simulate_access_changes")!;
    const stage = tools.find((tool) => tool.name === "stage_access_changes")!;
    const receipt = tools.find((tool) => tool.name === "get_access_review_receipt")!;

    await simulate.execute(
      { subject: "Alex Morgan", mode: "preserve_oncall" },
      { signal: liveSignal() },
    );
    const staged = await stage.execute(
      { subject: "Alex Morgan", acknowledgeNoRevocation: true },
      { signal: liveSignal() },
    );
    const beforeConfirmation = await receipt.execute(
      { reviewId: "alex-offboarding-2026-09-02" },
      { signal: liveSignal() },
    );

    expect(staged).toMatchObject({
      status: "staged",
      removedGrantCount: 5,
      preservedDependencyCount: 1,
      durableMutation: false,
    });
    expect(service.getSnapshot().durableRevocations).toEqual([]);
    expect(beforeConfirmation).toMatchObject({ status: "not_confirmed" });
  });

  it("honors an already-aborted execution signal", async () => {
    const controller = new AbortController();
    controller.abort(new DOMException("Stopped by caller", "AbortError"));
    const tool = createAccessReviewTools(new AccessReviewService())[0];

    expect(() =>
      tool.execute({ subject: "Alex Morgan" }, { signal: controller.signal }),
    ).toThrow("Stopped by caller");
  });

  it("supports execute(input) without an options object across all tools", async () => {
    const service = new AccessReviewService();
    const tools = Object.fromEntries(
      createAccessReviewTools(service).map((tool) => [tool.name, tool]),
    );

    await tools.get_identity_context.execute({ subject: "Alex Morgan" });
    await tools.get_effective_access.execute({ subject: "Alex Morgan" });
    await tools.trace_permission_path.execute({
      subject: "Alex Morgan",
      pathId: "path_nested_group",
    });
    await tools.find_access_risks.execute({ subject: "Alex Morgan" });
    await tools.simulate_access_changes.execute({
      subject: "Alex Morgan",
      mode: "preserve_oncall",
    });
    await tools.preview_access_delta.execute({ subject: "Alex Morgan" });
    await tools.stage_access_changes.execute({
      subject: "Alex Morgan",
      acknowledgeNoRevocation: true,
    });
    expect(
      await tools.get_access_review_receipt.execute({
        reviewId: "alex-offboarding-2026-09-02",
      }),
    ).toMatchObject({ status: "not_confirmed" });
    expect(
      await tools.cancel_staged_access_review.execute({
        reviewId: "alex-offboarding-2026-09-02",
      }),
    ).toMatchObject({ status: "cancelled" });
  });

  it("has no post-mutation pending promise for a mutating tool", () => {
    const service = new AccessReviewService();
    service.simulate("preserve_oncall");
    let notifications = 0;
    const unsubscribe = service.subscribe(() => {
      notifications += 1;
    });
    const stage = createAccessReviewTools(service).find(
      (tool) => tool.name === "stage_access_changes",
    )!;
    const requestFrame = vi.fn();
    vi.stubGlobal(
      "requestAnimationFrame",
      requestFrame,
    );
    const controller = new AbortController();
    const result = stage.execute(
      { subject: "Alex Morgan", acknowledgeNoRevocation: true },
      { signal: controller.signal },
    );

    expect(service.getSnapshot().phase).toBe("staged");
    expect(notifications).toBe(1);
    expect(result).not.toBeInstanceOf(Promise);
    expect(result).toMatchObject({
      status: "staged",
      durableMutation: false,
    });
    expect(requestFrame).not.toHaveBeenCalled();
    controller.abort(new DOMException("Cancelled after commit", "AbortError"));
    expect(service.getSnapshot().stagedPlan).not.toBeNull();
    unsubscribe();
    vi.unstubAllGlobals();
  });

  it("reports confirmed ownership through read tools without regressing the UI", async () => {
    const service = new AccessReviewService();
    service.simulate("preserve_oncall");
    service.stagePlan();
    service.confirmStage();
    const tools = createAccessReviewTools(service);
    const effectiveTool = tools.find((tool) => tool.name === "get_effective_access")!;
    const risksTool = tools.find((tool) => tool.name === "find_access_risks")!;

    const effective = await effectiveTool.execute(
      { subject: "Alex Morgan" },
      { signal: liveSignal() },
    );
    const riskResult = await risksTool.execute(
      { subject: "Alex Morgan" },
      { signal: liveSignal() },
    );

    expect(effective).toMatchObject({
      pathCount: 0,
      capabilityGrantCount: 0,
      preservedDependencyCount: 1,
      reviewStatus: "confirmed",
    });
    expect(riskResult).toEqual({ risks: [] });
    expect(service.getSnapshot()).toMatchObject({
      phase: "confirmed",
      stagedPlan: null,
    });
  });
});
